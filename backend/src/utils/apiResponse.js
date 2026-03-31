/**
 * API Response Helpers
 * Standardized response format for all API endpoints
 * PB06 - Personal Profile Management
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Send success response with message
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccessWithMessage = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 */
export const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Validation errors
 */
export const sendValidationError = (res, errors) => {
  const message = Array.isArray(errors) ? errors.join('; ') : errors;
  return res.status(400).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
export const sendNotFound = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`
  });
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const sendUnauthorized = (res, message = 'Not authorized') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const sendForbidden = (res, message = 'Access denied') => {
  return res.status(403).json({
    success: false,
    message
  });
};

export default {
  sendSuccess,
  sendSuccessWithMessage,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden
};
