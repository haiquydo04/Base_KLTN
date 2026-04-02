/**
 * Interest Service - PB07: Quản lý sở thích cá nhân
 * Business logic cho việc quản lý tags và user interests
 */

import Tag from '../models/Tag.js';
import UserTag from '../models/UserTag.js';

const MAX_INTERESTS = 15;
const MIN_TAG_LENGTH = 2;
const MAX_TAG_LENGTH = 30;

/**
 * Validate a single tag name
 * @param {string} tagName - Tag name to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateTagName = (tagName) => {
  if (!tagName || typeof tagName !== 'string') {
    return { valid: false, error: 'Tag name must be a string' };
  }

  const trimmed = tagName.trim();

  if (trimmed.length < MIN_TAG_LENGTH) {
    return { valid: false, error: `Tag name must be at least ${MIN_TAG_LENGTH} characters` };
  }

  if (trimmed.length > MAX_TAG_LENGTH) {
    return { valid: false, error: `Tag name cannot exceed ${MAX_TAG_LENGTH} characters` };
  }

  // Allow letters, numbers, spaces, and common punctuation
  const validPattern = /^[a-zA-ZÀ-ỹ0-9\s\-_]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: 'Tag name contains invalid characters' };
  }

  return { valid: true };
};

/**
 * Validate array of tag names
 * @param {string[]} tagNames - Array of tag names
 * @returns {{ valid: boolean, errors?: string[], tags?: string[] }}
 */
export const validateTags = (tagNames) => {
  if (!Array.isArray(tagNames)) {
    return { valid: false, errors: ['Tags must be an array'] };
  }

  if (tagNames.length === 0) {
    return { valid: false, errors: ['At least one tag is required'] };
  }

  if (tagNames.length > MAX_INTERESTS) {
    return { valid: false, errors: [`Maximum ${MAX_INTERESTS} tags allowed`] };
  }

  const errors = [];
  const validTags = [];

  // Remove duplicates (case-insensitive)
  const seen = new Set();

  for (const tagName of tagNames) {
    const validation = validateTagName(tagName);
    const normalizedTag = tagName.trim().toLowerCase();

    if (!validation.valid) {
      errors.push(`${tagName}: ${validation.error}`);
    } else if (seen.has(normalizedTag)) {
      errors.push(`${tagName}: Duplicate tag`);
    } else {
      seen.add(normalizedTag);
      validTags.push(tagName.trim());
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, tags: validTags };
};

/**
 * Get popular tags for display
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of tags to return
 * @param {string} options.category - Filter by category
 * @returns {Promise<Array>} Array of popular tags
 */
export const getPopularTags = async ({ limit = 50, category } = {}) => {
  const query = {};
  if (category) {
    query.category = category;
  }

  const tags = await Tag.find(query)
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .select('name category icon usageCount');

  return tags;
};

/**
 * Get all available tags
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of tags to return
 * @param {string} options.search - Search by name
 * @returns {Promise<Array>} Array of tags
 */
export const getAllTags = async ({ limit = 100, search } = {}) => {
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const tags = await Tag.find(query)
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .select('name category icon usageCount');

  return tags;
};

/**
 * Get user's current interests
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's tags
 */
export const getUserInterests = async (userId) => {
  const tags = await UserTag.getUserTags(userId);
  return tags;
};

/**
 * Set user's interests
 * Creates new tags if they don't exist
 * @param {string} userId - User ID
 * @param {string[]} tagNames - Array of tag names
 * @returns {Promise<{ success: boolean, interests: Array, created: number }>}
 */
export const setUserInterests = async (userId, tagNames) => {
  // Validate tags
  const validation = validateTags(tagNames);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors[0],
      errors: validation.errors
    };
  }

  const tagNamesToSet = validation.tags;

  // Find or create tags
  const tagDocs = [];
  const newTags = [];

  for (const tagName of tagNamesToSet) {
    const tag = await Tag.findOrCreateByName(tagName);
    tagDocs.push(tag);
    if (tag.usageCount === 0 || tag.isNew) {
      newTags.push(tag);
    }
  }

  // Get current user's tags to calculate usage changes
  const currentTags = await UserTag.find({ userId }).lean();
  const currentTagIds = new Set(currentTags.map(t => t.tagId.toString()));
  const newTagIds = new Set(tagDocs.map(t => t._id.toString()));

  // Find tags to decrement (removed by user)
  const removedTagIds = [...currentTagIds].filter(id => !newTagIds.has(id));

  // Find tags to increment (newly added)
  const addedTagIds = tagDocs.filter(t => !currentTagIds.has(t._id.toString())).map(t => t._id);

  // Get old tag IDs for decrement (before the update)
  const oldTagIds = currentTags.map(t => t.tagId);

  // Remove old user-tag relationships
  await UserTag.deleteMany({ userId });

  // Create new user-tag relationships
  await UserTag.setUserTags(userId, tagDocs.map(t => t._id));

  // Update usage counts
  if (oldTagIds.length > 0) {
    await Tag.decrementUsage(oldTagIds);
  }
  if (addedTagIds.length > 0) {
    await Tag.incrementUsage(addedTagIds);
  }

  // Fetch updated tags
  const updatedTags = await UserTag.getUserTags(userId);

  return {
    success: true,
    interests: updatedTags,
    created: newTags.length
  };
};

/**
 * Add a single interest to user
 * @param {string} userId - User ID
 * @param {string} tagName - Tag name to add
 * @returns {Promise<{ success: boolean, interest?: Object, error?: string }>}
 */
export const addUserInterest = async (userId, tagName) => {
  // Validate tag
  const validation = validateTagName(tagName);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check if user already has this tag
  const existingTags = await UserTag.getUserTags(userId);
  const normalizedTagName = tagName.trim().toLowerCase();
  const hasTag = existingTags.some(t => t.name.toLowerCase() === normalizedTagName);

  if (hasTag) {
    return { success: false, error: 'Tag already exists in your interests' };
  }

  // Check max limit
  if (existingTags.length >= MAX_INTERESTS) {
    return { success: false, error: `Maximum ${MAX_INTERESTS} tags allowed` };
  }

  // Find or create tag
  const tag = await Tag.findOrCreateByName(tagName);

  // Check if user already has this tag via UserTag
  const alreadyLinked = await UserTag.userHasTag(userId, tag._id);
  if (alreadyLinked) {
    return { success: false, error: 'Tag already exists in your interests' };
  }

  // Create user-tag relationship
  await UserTag.create({ userId, tagId: tag._id });

  // Increment usage count
  await Tag.incrementUsage([tag._id]);

  return {
    success: true,
    interest: tag
  };
};

/**
 * Remove a single interest from user
 * @param {string} userId - User ID
 * @param {string} tagId - Tag ID to remove
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const removeUserInterest = async (userId, tagId) => {
  const userTag = await UserTag.findOne({ userId, tagId });
  if (!userTag) {
    return { success: false, error: 'Tag not found in your interests' };
  }

  await UserTag.deleteOne({ _id: userTag._id });
  await Tag.decrementUsage([tagId]);

  return { success: true };
};

export default {
  validateTagName,
  validateTags,
  getPopularTags,
  getAllTags,
  getUserInterests,
  setUserInterests,
  addUserInterest,
  removeUserInterest
};
