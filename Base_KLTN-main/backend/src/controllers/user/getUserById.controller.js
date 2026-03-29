/**
 * Get User By ID Controller - Thin layer, delegates to service
 */
import userService from '../../services/user.service.js';

export const getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    res.json({ success: true, user: result.user });
  } catch (error) {
    next(error);
  }
};

export default { getUserById };
