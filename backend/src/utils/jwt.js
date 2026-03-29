import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

export default { generateToken, verifyToken };
