/**
 * Get Users Controller - Thin layer, delegates to service
 */
import userService from '../../services/user.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await userService.getAllUsers(req.user._id, { page, limit });
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, users: result.users, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export default { getUsers };
