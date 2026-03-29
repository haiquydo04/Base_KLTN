/**
 * Google OAuth Login Controller
 * Handles idToken verification and user login/registration
 * Endpoint: POST /api/auth/google-login
 */
import { OAuth2Client } from 'google-auth-library';
import authService from '../../services/auth.service.js';
import config from '../../config/index.js';

const getGoogleClient = () => {
  if (!config.google?.clientID) {
    return null;
  }
  return new OAuth2Client(config.google.clientID);
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'idToken is required'
      });
    }

    const client = getGoogleClient();

    if (!client) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server'
      });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: config.google.clientID
      });
      payload = ticket.getPayload();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google token'
      });
    }

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Failed to verify Google token'
      });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const avatar = payload.picture || '';

    const result = await authService.socialLogin({
      googleId,
      facebookId: null,
      email,
      username: null,
      fullName,
      avatar
    });

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    next(error);
  }
};

export default { googleLogin };
