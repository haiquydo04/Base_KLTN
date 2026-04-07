/**
 * Debug Utilities for Frontend
 * Helps trace API calls and data flow
 */

// Enable/disable debug mode
const DEBUG_MODE = import.meta.env?.DEV || true;

/**
 * Log API request details
 */
export function logRequest(method, url, data = null) {
  if (!DEBUG_MODE) return;
  console.log(`[API] ${method} ${url}`, data ? { body: data } : '');
}

/**
 * Log API response details
 */
export function logResponse(method, url, status, data) {
  if (!DEBUG_MODE) return;
  console.log(`[API] ${method} ${url} -> ${status}`, {
    data: data,
    keys: Object.keys(data || {}),
    type: Array.isArray(data) ? 'array' : typeof data
  });
}

/**
 * Log API error details
 */
export function logError(method, url, error) {
  console.error(`[API ERROR] ${method} ${url}`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
}

/**
 * Extract data from various response formats
 * Handles: { success, data } | { data } | { users } | { matches } | { messages } | direct array
 */
export function extractData(response, key = null) {
  if (!response) return null;

  // If key is specified, try to get it directly
  if (key) {
    const directValue = response[key] ?? response?.data?.[key];
    if (directValue !== undefined) return directValue;
  }

  // Try common patterns
  const patterns = [
    // { success, data: { ... } }
    (r) => r?.data?.data,
    // { success, data: [...] }
    (r) => r?.data,
    // { data: [...] } or { users: [...] }
    (r) => r?.users || r?.matches || r?.messages || r?.tags || r?.interests || r?.conversations,
    // Direct response
    (r) => r,
  ];

  for (const pattern of patterns) {
    const result = pattern(response);
    if (result !== undefined) return result;
  }

  return response;
}

/**
 * Safe array extraction
 */
export function extractArray(response, key) {
  const data = extractData(response, key);
  return Array.isArray(data) ? data : [];
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Create axios response interceptor for logging
 */
export function createResponseLogger() {
  return (response) => {
    logResponse(
      response.config?.method?.toUpperCase() || 'UNKNOWN',
      response.config?.url || '',
      response.status,
      response.data
    );
    return response;
  };
}

/**
 * Create axios error interceptor for logging
 */
export function createErrorLogger() {
  return (error) => {
    logError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || '',
      error
    );
    return Promise.reject(error);
  };
}

/**
 * Debug hook for React components
 */
export function useApiDebug(endpoint, response, error) {
  if (import.meta.env?.DEV) {
    console.log(`[DEBUG] ${endpoint}:`, {
      response,
      error,
      timestamp: new Date().toISOString()
    });
  }
}

export default {
  logRequest,
  logResponse,
  logError,
  extractData,
  extractArray,
  formatDate,
  createResponseLogger,
  createErrorLogger,
  useApiDebug,
};
