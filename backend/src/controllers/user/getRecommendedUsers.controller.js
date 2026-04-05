/**
 * Get Recommended Users Controller - Thin layer, delegates to service
 */
import userService from '../../services/user.service.js';

export const getRecommendedUsers = async (req, res, next) => {
  try {
    // ✅ FIX: Check if refresh PARAM EXISTS (not just 'true')
    // Frontend sends timestamp like ?refresh=1740816000000
    const isRefresh = !!req.query.refresh;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    console.log('[GetRecommendedUsers] isRefresh:', isRefresh, '| page:', page, '| limit:', limit);

    const result = await userService.getRecommendedUsers(req.user._id, {
      refresh: isRefresh,
      page,
      limit
    });

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    console.log('[GetRecommendedUsers] returning', result.users?.length, 'users with pagination');

    // Return with pagination metadata
    return res.json({
      success: true,
      users: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export default { getRecommendedUsers };
