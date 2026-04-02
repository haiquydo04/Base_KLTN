/**
 * Interest Controller - PB07: Quản lý sở thích cá nhân
 * Handles HTTP requests cho việc quản lý tags và user interests
 */

import interestService from '../../services/interest.service.js';
import { sendSuccess, sendError, sendValidationError } from '../../utils/apiResponse.js';

/**
 * GET /api/tags
 * Lấy danh sách tag phổ biến để hiển thị trên trang "Sở thích"
 * Query params: ?limit=50&category=general&search=music
 */
export const getTags = async (req, res, next) => {
  try {
    const { limit, category, search } = req.query;

    let tags;
    if (search) {
      tags = await interestService.getAllTags({
        limit: parseInt(limit) || 100,
        search: search.trim()
      });
    } else {
      tags = await interestService.getPopularTags({
        limit: parseInt(limit) || 50,
        category
      });
    }

    return sendSuccess(res, {
      tags,
      total: tags.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/interests
 * Lấy danh sách sở thích hiện tại của user
 */
export const getUserInterests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const interests = await interestService.getUserInterests(userId);

    return sendSuccess(res, {
      interests,
      total: interests.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/interests
 * Cập nhật danh sách sở thích của user
 * Body: { tags: ["music", "travel", "cooking"] }
 */
export const updateUserInterests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { tags } = req.body;

    // Validate input
    if (!tags) {
      return sendValidationError(res, 'Tags array is required');
    }

    if (!Array.isArray(tags)) {
      return sendValidationError(res, 'Tags must be an array');
    }

    // Empty array is allowed (clear all interests)
    if (tags.length === 0) {
      const result = await interestService.setUserInterests(userId, []);
      return sendSuccess(res, {
        message: 'All interests cleared',
        interests: [],
        total: 0
      });
    }

    // Update interests
    const result = await interestService.setUserInterests(userId, tags);

    if (!result.success) {
      return sendValidationError(res, result.error, result.errors);
    }

    return sendSuccess(res, {
      message: 'Interests updated successfully',
      interests: result.interests,
      total: result.interests.length,
      created: result.created
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/interests/add
 * Thêm một sở thích vào danh sách
 * Body: { tag: "music" }
 */
export const addUserInterest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { tag } = req.body;

    if (!tag || typeof tag !== 'string') {
      return sendValidationError(res, 'Tag name is required and must be a string');
    }

    const result = await interestService.addUserInterest(userId, tag);

    if (!result.success) {
      return sendError(res, result.error, 400);
    }

    return sendSuccess(res, {
      message: 'Interest added successfully',
      interest: result.interest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/interests/:tagId
 * Xóa một sở thích khỏi danh sách
 */
export const removeUserInterest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { tagId } = req.params;

    if (!tagId) {
      return sendValidationError(res, 'Tag ID is required');
    }

    const result = await interestService.removeUserInterest(userId, tagId);

    if (!result.success) {
      return sendError(res, result.error, 404);
    }

    return sendSuccess(res, {
      message: 'Interest removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTags,
  getUserInterests,
  updateUserInterests,
  addUserInterest,
  removeUserInterest
};
