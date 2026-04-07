/**
 * Test Endpoints Script - Tự động test tất cả API endpoints
 * Chạy: node test_endpoints.js
 * Yêu cầu: Backend đang chạy trên localhost:5000
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

// ============================================
// CẤU HÌNH
// ============================================

const CONFIG = {
  colors: {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
  },
  testUser: {
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@test.com',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    fullName: 'Test User'
  },
  testAdmin: {
    email: 'admin@test.com',
    password: 'password123'
  }
};

// ============================================
// KẾT QUẢ TEST
// ============================================

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  emptyData: [],
  ok: []
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function log(title, message, type = 'info') {
  const { colors } = CONFIG;
  const prefixes = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[PASS]${colors.reset}`,
    fail: `${colors.red}[FAIL]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    skip: `${colors.yellow}[SKIP]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    section: `${colors.magenta}[TEST]${colors.reset}`,
    endpoint: `${colors.cyan}[EP]${colors.reset}`
  };
  console.log(`${prefixes[type]} ${title ? colors.white + title + colors.reset : ''} ${message || ''}`);
}

function formatResponse(data) {
  if (!data) return 'No data';
  if (typeof data === 'string') return data.substring(0, 100);
  const str = JSON.stringify(data);
  return str.length > 150 ? str.substring(0, 150) + '...' : str;
}

function formatEndpoint(method, path) {
  return `${CONFIG.colors.cyan}${method.padEnd(7)}${CONFIG.colors.reset} ${CONFIG.colors.white}${path}${CONFIG.colors.reset}`;
}

async function makeRequest(method, path, options = {}) {
  const { token, body, auth } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(auth && { 'Authorization': `Bearer ${auth}` })
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    let data;
    try {
      data = await response.json();
    } catch {
      data = { raw: await response.text() };
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

async function testEndpoint(method, path, options = {}) {
  const { name, body, auth, expectStatus, skipAuth, description } = options;
  results.total++;

  const endpointName = name || `${method} ${path}`;
  const statusInfo = expectStatus ? ` (expect ${expectStatus})` : '';

  log('endpoint', `${formatEndpoint(method, path)}${statusInfo}`, 'section');

  const response = await makeRequest(method, path, {
    token: skipAuth ? null : (options.token || auth),
    body
  });

  if (response.status === 0) {
    log('error', `Connection failed: ${response.error}`, 'fail');
    results.failed++;
    results.errors.push({ endpoint: endpointName, error: response.error, type: 'CONNECTION' });
    return { success: false, response };
  }

  const passed = !expectStatus || response.status === expectStatus;

  if (response.ok && passed) {
    log('success', `${endpointName} - Status: ${response.status}`, 'success');

    // Check if response has empty data
    if (isEmptyResponse(response.data)) {
      log('warn', `  Response has empty/null data`, 'warn');
      results.emptyData.push({ endpoint: endpointName, response: response.data });
    } else {
      results.ok.push({ endpoint: endpointName, status: response.status });
    }

    return { success: true, response };
  } else {
    log('fail', `${endpointName} - Status: ${response.status}`, 'fail');
    log('error', `  Response: ${formatResponse(response.data)}`, 'error');
    results.failed++;
    results.errors.push({
      endpoint: endpointName,
      status: response.status,
      response: response.data,
      type: 'HTTP_ERROR'
    });
    return { success: false, response };
  }
}

function isEmptyResponse(data) {
  if (!data) return true;
  if (data.success === false) return false; // Error response is not "empty"
  if (Array.isArray(data.data) && data.data.length === 0) return true;
  if (Array.isArray(data.users) && data.users.length === 0) return true;
  if (Array.isArray(data.tags) && data.tags.length === 0) return true;
  if (data.data && Object.keys(data.data).length === 0) return true;
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// AUTH & USER MANAGEMENT
// ============================================

async function registerTestUser() {
  log('info', 'Creating test user...', 'section');

  const response = await makeRequest('POST', '/auth/register', {
    body: {
      username: CONFIG.testUser.username,
      email: CONFIG.testUser.email,
      password: CONFIG.testUser.password,
      confirmPassword: CONFIG.testUser.confirmPassword
    }
  });

  if (response.ok && response.data.token) {
    log('success', `Test user created: ${CONFIG.testUser.username}`, 'success');
    return {
      token: response.data.token,
      user: response.data.user,
      userId: response.data.user?._id
    };
  }

  // User might already exist, try login
  const loginRes = await makeRequest('POST', '/auth/login', {
    body: { email: CONFIG.testUser.email, password: CONFIG.testUser.password }
  });

  if (loginRes.ok && loginRes.data.token) {
    log('success', `Test user logged in: ${CONFIG.testUser.email}`, 'success');
    return {
      token: loginRes.data.token,
      user: loginRes.data.user,
      userId: loginRes.data.user?._id
    };
  }

  log('error', `Failed to create/login test user`, 'error');
  return null;
}

async function registerTestAdmin() {
  log('info', 'Creating test admin...', 'section');

  // Try to create admin
  const regRes = await makeRequest('POST', '/auth/register', {
    body: {
      username: 'admin_' + Date.now(),
      email: 'admin_' + Date.now() + '@test.com',
      password: 'Admin123!',
      fullName: 'Admin User'
    }
  });

  if (regRes.ok && regRes.data.token) {
    return {
      token: regRes.data.token,
      user: regRes.data.user,
      userId: regRes.data.user?._id
    };
  }

  // Try login with test credentials
  const loginRes = await makeRequest('POST', '/auth/login', {
    body: CONFIG.testAdmin
  });

  if (loginRes.ok && loginRes.data.token) {
    return {
      token: loginRes.data.token,
      user: loginRes.data.user,
      userId: loginRes.data.user?._id
    };
  }

  log('warn', `No admin account available`, 'warn');
  return null;
}

// ============================================
// TEST SUITES
// ============================================

async function testHealthEndpoints() {
  console.log('\n' + '═'.repeat(60));
  log('section', 'HEALTH CHECK ENDPOINTS', 'section');
  console.log('═'.repeat(60));

  await testEndpoint('GET', '/health', {
    name: 'Health Check',
    skipAuth: true,
    expectStatus: 200
  });
}

async function testAuthEndpoints(skipAuth = false) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'AUTH ENDPOINTS (/api/auth)', 'section');
  console.log('═'.repeat(60));

  // Public endpoints
  await testEndpoint('POST', '/auth/register', {
    name: 'Register (new user)',
    body: {
      username: 'newuser_' + Date.now(),
      email: 'new_' + Date.now() + '@test.com',
      password: 'Test123!',
      confirmPassword: 'Test123!'
    },
    skipAuth: true,
    expectStatus: 201
  });

  await testEndpoint('POST', '/auth/login', {
    name: 'Login',
    body: { email: CONFIG.testUser.email, password: CONFIG.testUser.password },
    skipAuth: true,
    expectStatus: 200
  });

  await testEndpoint('POST', '/auth/forgot-password', {
    name: 'Forgot Password',
    body: { email: CONFIG.testUser.email },
    skipAuth: true
  });

  await testEndpoint('POST', '/auth/verify-otp', {
    name: 'Verify OTP',
    body: { email: CONFIG.testUser.email, otp: '123456' },
    skipAuth: true
  });

  await testEndpoint('POST', '/auth/reset-password', {
    name: 'Reset Password',
    body: { email: CONFIG.testUser.email, otp: '123456', newPassword: 'NewPass123!' },
    skipAuth: true
  });

  await testEndpoint('POST', '/auth/google-login', {
    name: 'Google Login (invalid token)',
    body: { token: 'invalid-token' },
    skipAuth: true
  });
}

async function testUserEndpoints(token) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'USER ENDPOINTS (/api/users)', 'section');
  console.log('═'.repeat(60));

  // Get current user info
  const meRes = await testEndpoint('GET', '/auth/me', {
    name: 'Get Current User',
    auth: token,
    expectStatus: 200
  });

  // Get user profile
  await testEndpoint('GET', '/users', {
    name: 'Get Users List',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/users/recommendations', {
    name: 'Get Recommended Users',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/users/matches', {
    name: 'Get User Matches',
    auth: token,
    expectStatus: 200
  });

  if (meRes.response?.data?.user?._id) {
    await testEndpoint('GET', `/users/${meRes.response.data.user._id}`, {
      name: 'Get User By ID',
      auth: token,
      expectStatus: 200
    });
  }
}

async function testMatchEndpoints(token) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'MATCH ENDPOINTS (/api/match)', 'section');
  console.log('═'.repeat(60));

  await testEndpoint('POST', '/match/like', {
    name: 'Like User',
    auth: token,
    body: { targetUserId: '507f1f77bcf86cd799439011' } // Fake ID for testing
  });

  await testEndpoint('POST', '/match/pass', {
    name: 'Pass User',
    auth: token,
    body: { targetUserId: '507f1f77bcf86cd799439011' }
  });

  await testEndpoint('GET', '/match/likes', {
    name: 'Get Likes',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/match/mutual', {
    name: 'Get Mutual Likes',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/match/swipes', {
    name: 'Get Swipe History',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('DELETE', '/match/507f1f77bcf86cd799439011', {
    name: 'Unmatch',
    auth: token
  });
}

async function testMessageEndpoints(token) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'MESSAGE ENDPOINTS (/api/messages)', 'section');
  console.log('═'.repeat(60));

  await testEndpoint('GET', '/messages/conversations', {
    name: 'Get Conversations',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/messages/507f1f77bcf86cd799439011', {
    name: 'Get Messages',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('POST', '/messages/507f1f77bcf86cd799439011', {
    name: 'Send Message',
    auth: token,
    body: { content: 'Test message' }
  });

  await testEndpoint('PUT', '/messages/507f1f77bcf86cd799439011/read', {
    name: 'Mark as Read',
    auth: token
  });
}

async function testProfileEndpoints(token) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'PROFILE ENDPOINTS (/api/profile, /api/v1/profiles)', 'section');
  console.log('═'.repeat(60));

  // /api/profile routes
  await testEndpoint('GET', '/profile', {
    name: 'Get My Profile',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('PUT', '/profile', {
    name: 'Update Profile',
    auth: token,
    body: {
      fullName: 'Updated Name',
      bio: 'Updated bio',
      gender: 'male',
      dateOfBirth: '1995-01-01'
    }
  });

  await testEndpoint('GET', '/profile/stats', {
    name: 'Get Profile Stats',
    auth: token,
    expectStatus: 200
  });

  // /api/v1/profiles routes
  await testEndpoint('GET', '/v1/profiles/stats', {
    name: 'Get Profile Stats v1',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/v1/profiles/507f1f77bcf86cd799439011', {
    name: 'Get Profile by ID',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/v1/profiles/507f1f77bcf86cd799439011/full', {
    name: 'Get Full Profile Detail',
    auth: token,
    expectStatus: 200
  });
}

async function testDiscoveryEndpoints(token) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'DISCOVERY ENDPOINTS (/api/discovery, /api/update-location)', 'section');
  console.log('═'.repeat(60));

  await testEndpoint('POST', '/update-location', {
    name: 'Update Location',
    auth: token,
    body: {
      latitude: 10.0452,
      longitude: 105.7469,
      locationText: 'Can Tho, Vietnam'
    }
  });

  await testEndpoint('GET', '/discovery', {
    name: 'Discover Users',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/discovery?lat=10.0452&lng=105.7469&radius=50000', {
    name: 'Discover Users (with location)',
    auth: token,
    expectStatus: 200
  });
}

async function testInterestEndpoints(token) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'INTEREST ENDPOINTS (/api/tags, /api/users/interests)', 'section');
  console.log('═'.repeat(60));

  // Public
  await testEndpoint('GET', '/tags', {
    name: 'Get Tags',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/tags?limit=10', {
    name: 'Get Tags (limited)',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/tags?category=interest', {
    name: 'Get Tags by Category',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('GET', '/tags?search=music', {
    name: 'Search Tags',
    auth: token,
    expectStatus: 200
  });

  // Private
  await testEndpoint('GET', '/users/interests', {
    name: 'Get User Interests',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('POST', '/users/interests', {
    name: 'Update User Interests',
    auth: token,
    body: { tags: ['music', 'travel', 'cooking'] }
  });

  await testEndpoint('POST', '/users/interests/add', {
    name: 'Add User Interest',
    auth: token,
    body: { tag: 'gaming' }
  });

  await testEndpoint('DELETE', '/users/interests/507f1f77bcf86cd799439011', {
    name: 'Remove User Interest',
    auth: token
  });
}

async function testSafetyEndpoints(token) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'SAFETY ENDPOINTS (/api/report, /api/block)', 'section');
  console.log('═'.repeat(60));

  // Public (or needs auth based on route config)
  await testEndpoint('GET', '/report/reasons', {
    name: 'Get Report Reasons',
    auth: token,
    expectStatus: 200
  });

  // Private
  await testEndpoint('POST', '/report', {
    name: 'Create Report',
    auth: token,
    body: {
      targetId: '507f1f77bcf86cd799439011',
      reason: 'fake_profile',
      description: 'This is a test report'
    }
  });

  await testEndpoint('POST', '/block', {
    name: 'Create Block',
    auth: token,
    body: {
      targetId: '507f1f77bcf86cd799439011',
      reason: 'Harassment'
    }
  });

  await testEndpoint('GET', '/block', {
    name: 'Get Blocked Users',
    auth: token,
    expectStatus: 200
  });

  await testEndpoint('DELETE', '/block/507f1f77bcf86cd799439011', {
    name: 'Unblock User',
    auth: token
  });
}

async function testAdminEndpoints(adminToken) {
  console.log('\n' + '═'.repeat(60));
  log('section', 'ADMIN ENDPOINTS (/api/admin)', 'section');
  console.log('═'.repeat(60));

  if (!adminToken) {
    log('warn', 'No admin token, skipping admin tests', 'skip');
    return;
  }

  // Auth
  await testEndpoint('POST', '/admin/login', {
    name: 'Admin Login',
    body: CONFIG.testAdmin,
    skipAuth: true
  });

  await testEndpoint('GET', '/admin/me', {
    name: 'Get Admin Info',
    auth: adminToken,
    expectStatus: 200
  });

  // User Management
  await testEndpoint('GET', '/admin/users', {
    name: 'Get All Users',
    auth: adminToken,
    expectStatus: 200
  });

  await testEndpoint('PUT', '/admin/users/507f1f77bcf86cd799439011/status', {
    name: 'Toggle User Status',
    auth: adminToken,
    body: { isLocked: true }
  });

  await testEndpoint('PUT', '/admin/users/507f1f77bcf86cd799439011/role', {
    name: 'Update User Role',
    auth: adminToken,
    body: { role: 'premium' }
  });

  // Categories
  await testEndpoint('GET', '/admin/categories', {
    name: 'Get Categories',
    auth: adminToken,
    expectStatus: 200
  });

  await testEndpoint('POST', '/admin/categories', {
    name: 'Add Category',
    auth: adminToken,
    body: { name: 'Test Category', category: 'general', description: 'Test' }
  });

  await testEndpoint('PUT', '/admin/categories/507f1f77bcf86cd799439011', {
    name: 'Update Category',
    auth: adminToken,
    body: { name: 'Updated Category' }
  });

  await testEndpoint('PUT', '/admin/categories/507f1f77bcf86cd799439011/status', {
    name: 'Toggle Category Status',
    auth: adminToken
  });

  await testEndpoint('DELETE', '/admin/categories/507f1f77bcf86cd799439011', {
    name: 'Delete Category',
    auth: adminToken
  });

  // Dashboard
  await testEndpoint('GET', '/admin/dashboard/stats', {
    name: 'Dashboard Stats',
    auth: adminToken,
    expectStatus: 200
  });

  await testEndpoint('GET', '/admin/dashboard/growth?days=7', {
    name: 'User Growth',
    auth: adminToken,
    expectStatus: 200
  });

  await testEndpoint('GET', '/admin/dashboard/gender', {
    name: 'Gender Distribution',
    auth: adminToken,
    expectStatus: 200
  });

  await testEndpoint('GET', '/admin/dashboard/recent-users', {
    name: 'Recent Users',
    auth: adminToken,
    expectStatus: 200
  });
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runTests() {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(12) + 'API ENDPOINT TEST SUITE' + ' '.repeat(25) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  log('info', `Base URL: ${BASE_URL}`, 'info');
  log('info', `Time: ${new Date().toISOString()}`, 'info');
  console.log('');

  // Create test users
  const testUser = await registerTestUser();
  const testAdmin = await registerTestAdmin();

  if (!testUser) {
    log('error', 'Cannot proceed without test user', 'error');
    process.exit(1);
  }

  // Run all test suites
  await testHealthEndpoints();
  await testAuthEndpoints(testUser.token);
  await testUserEndpoints(testUser.token);
  await testMatchEndpoints(testUser.token);
  await testMessageEndpoints(testUser.token);
  await testProfileEndpoints(testUser.token);
  await testDiscoveryEndpoints(testUser.token);
  await testInterestEndpoints(testUser.token);
  await testSafetyEndpoints(testUser.token);
  await testAdminEndpoints(testAdmin?.token);

  // Print summary
  printSummary();
}

function printSummary() {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(18) + 'TEST SUMMARY' + ' '.repeat(29) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  const { colors } = CONFIG;

  console.log(`\n  ${colors.white}Total Endpoints:${colors.reset}   ${results.total}`);
  console.log(`  ${colors.green}Passed:${colors.reset}          ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
  console.log(`  ${colors.red}Failed:${colors.reset}          ${results.failed}`);
  console.log(`  ${colors.yellow}Skipped:${colors.reset}        ${results.skipped}`);

  // OK endpoints
  if (results.ok.length > 0) {
    console.log(`\n${colors.green}✓ ENDPOINTS OK:${colors.reset}`);
    results.ok.forEach(item => {
      console.log(`  ${colors.green}✓${colors.reset} ${item.endpoint} [${item.status}]`);
    });
  }

  // Empty data endpoints
  if (results.emptyData.length > 0) {
    console.log(`\n${colors.yellow}⚠ ENDPOINTS WITH EMPTY DATA:${colors.reset}`);
    results.emptyData.forEach(item => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${item.endpoint}`);
    });
  }

  // Errors
  if (results.errors.length > 0) {
    console.log(`\n${colors.red}✗ ERRORS:${colors.reset}`);
    results.errors.forEach(item => {
      console.log(`  ${colors.red}✗${colors.reset} ${item.endpoint}`);
      if (item.status) console.log(`    Status: ${item.status}`);
      if (item.error) console.log(`    Error: ${item.error}`);
      if (item.type) console.log(`    Type: ${item.type}`);
      if (item.response?.message) console.log(`    Message: ${item.response.message}`);
    });
  }

  console.log('\n' + '═'.repeat(60));

  if (results.failed === 0 && results.errors.length === 0) {
    log('success', 'ALL TESTS PASSED!', 'success');
  } else {
    log('warn', `Tests completed with ${results.failed} failures`, 'warn');
  }
}

// ============================================
// RUN
// ============================================

runTests().catch(error => {
  log('error', `Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
