import Tag from '../models/Tag.js';
import User from '../models/User.js';
import UserTag from '../models/UserTag.js';

/**
 * Sync usage counts for all tags in the database
 * Scans User and UserTag collections to get accurate numbers
 */
export const syncAllTagsUsage = async () => {
  try {
    const allTags = await Tag.find({});
    const results = {
      updated: 0,
      total: allTags.length,
      errors: []
    };

    for (const tag of allTags) {
      let count = 0;
      const tagName = tag.name;

      try {
        if (tag.category === 'interest') {
          // Count from User.interests (strings)
          const interestCount = await User.countDocuments({ interests: tagName });
          // Count from UserTag (ObjectIds)
          const userTagCount = await UserTag.countDocuments({ tagId: tag._id });
          count = interestCount + userTagCount;
        } else if (tag.category === 'occupation') {
          // Count from User.occupation (string)
          count = await User.countDocuments({ occupation: tagName });
        } else if (tag.category === 'location') {
          // Count from User.locationText (string)
          count = await User.countDocuments({ locationText: tagName });
        } else {
          // Default: check UserTag
          count = await UserTag.countDocuments({ tagId: tag._id });
        }

        // Only update if changed
        if (tag.usageCount !== count) {
          tag.usageCount = count;
          await tag.save();
          results.updated++;
        }
      } catch (err) {
        results.errors.push({ id: tag._id, name: tag.name, error: err.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error in syncAllTagsUsage:', error);
    throw error;
  }
};

/**
 * Sync usage count for a specific tag
 */
export const syncSingleTagUsage = async (tagId) => {
  const tag = await Tag.findById(tagId);
  if (!tag) return null;

  let count = 0;
  const tagName = tag.name;

  if (tag.category === 'interest') {
    const interestCount = await User.countDocuments({ interests: tagName });
    const userTagCount = await UserTag.countDocuments({ tagId: tag._id });
    count = interestCount + userTagCount;
  } else if (tag.category === 'occupation') {
    count = await User.countDocuments({ occupation: tagName });
  } else if (tag.category === 'location') {
    count = await User.countDocuments({ locationText: tagName });
  } else {
    count = await UserTag.countDocuments({ tagId: tag._id });
  }

  tag.usageCount = count;
  await tag.save();
  return count;
};

export default {
  syncAllTagsUsage,
  syncSingleTagUsage
};
