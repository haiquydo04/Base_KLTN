/**
 * Test Flow Script - Test API theo flow thực tế
 * Chạy: node test_flow.js
 * 
 * Flow test:
 * (A) Profile - Lấy profile từ userId thật
 * (B) Like -> Match - Tạo match bằng like qua lại
 * (C) Match - Lấy danh sách match
 * (D) Message - Gửi và nhận message
 * (E) Interest - Quản lý interests
 * (F) Report/Block - Report và block user
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './src/config/index.js';

// Import models
import User from './src/models/User.js';
import Swipe from './src/models/Swipe.js';
import Match from './src/models/Match.js';
import Message from './src/models/Message.js';
import Tag from './src/models/Tag.js';
import UserTag from './src/models/UserTag.js';
import Report from './src/models/Report.js';
import Block from './src/models/Block.js';

// ============================================
// CẤU HÌNH
// ============================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// ============================================
// DỮ LIỆU TEST
// ============================================

let testData = {
  users: [], // 5 users với token
  tags: [],  // 3 tags
  matches: [], // 2 matches
  conversation: null
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function log(title, message, type = 'info') {
  const prefixes = {
    info: `${COLORS.blue}[INFO]${COLORS.reset}`,
    success: `${COLORS.green}[PASS]${COLORS.reset}`,
    fail: `${COLORS.red}[FAIL]${COLORS.reset}`,
    warn: `${COLORS.yellow}[WARN]${COLORS.reset}`,
    section: `${COLORS.magenta}[FLOW]${COLORS.reset}`,
    step: `${COLORS.cyan}[STEP]${COLORS.reset}`,
    data: `${COLORS.yellow}[DATA]${COLORS.reset}`
  };
  console.log(`${prefixes[type]} ${COLORS.white}${title}${COLORS.reset} ${message || ''}`);
}

function formatResponse(data) {
  if (!data) return 'No data';
  if (typeof data === 'string') return data.substring(0, 100);
  const str = JSON.stringify(data, null, 2);
  return str.length > 200 ? str.substring(0, 200) + '...' : str;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, path, options = {}) {
  const { token, body } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
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
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    return { status: 0, ok: false, error: error.message };
  }
}

async function registerUser(userData) {
  const response = await makeRequest('POST', '/auth/register', {
    body: {
      ...userData,
      confirmPassword: userData.password
    }
  });

  if (response.ok && response.data.token) {
    return {
      token: response.data.token,
      user: response.data.user,
      userId: response.data.user?._id
    };
  }
  return null;
}

async function loginUser(email, password) {
  const response = await makeRequest('POST', '/auth/login', {
    body: { email, password }
  });

  if (response.ok && response.data.token) {
    return {
      token: response.data.token,
      user: response.data.user,
      userId: response.data.user?._id
    };
  }
  return null;
}

// ============================================
// PHASE 0: SEED DỮ LIỆU
// ============================================

async function seedDatabase() {
  log('section', 'PHASE 0: SEED DỮ LIỆU', 'section');
  console.log('');

  try {
    // Kết nối MongoDB
    await mongoose.connect(config.mongodbUri);
    log('info', 'Connected to MongoDB');

    // Xóa dữ liệu cũ liên quan
    log('info', 'Cleaning old test data...');
    await Promise.all([
      User.deleteMany({ email: /_testflow_@test\.com$/ }),
      Swipe.deleteMany({}),
      Match.deleteMany({}),
      Message.deleteMany({}),
      UserTag.deleteMany({})
    ]);
    log('success', 'Cleaned old data');

    // Tạo 5 users
    log('info', 'Creating 5 test users...');
    const users = [];
    const userTemplates = [
      { username: 'userA_testflow', email: 'userA_testflow_@test.com', fullName: 'User A Test' },
      { username: 'userB_testflow', email: 'userB_testflow_@test.com', fullName: 'User B Test' },
      { username: 'userC_testflow', email: 'userC_testflow_@test.com', fullName: 'User C Test' },
      { username: 'userD_testflow', email: 'userD_testflow_@test.com', fullName: 'User D Test' },
      { username: 'userE_testflow', email: 'userE_testflow_@test.com', fullName: 'User E Test' }
    ];

    const salt = await bcrypt.genSalt(10);

    for (const template of userTemplates) {
      const result = await registerUser({
        ...template,
        password: 'Test123!',
        confirmPassword: 'Test123!'
      });

      if (result) {
        // Update user với thêm data
        await User.findByIdAndUpdate(result.userId, {
          age: 25,
          gender: 'male',
          bio: `Test bio for ${template.fullName}`,
          avatar: `https://randomuser.me/api/portraits/men/1.jpg`
        });

        users.push({
          ...result,
          email: template.email
        });
        log('success', `Created: ${template.fullName} (${template.email})`);
      } else {
        // Thử login nếu user đã tồn tại
        const loginResult = await loginUser(template.email, 'Test123!');
        if (loginResult) {
          users.push({
            ...loginResult,
            email: template.email
          });
          log('success', `Logged in: ${template.fullName}`);
        }
      }
    }

    if (users.length < 5) {
      throw new Error(`Only created ${users.length}/5 users`);
    }

    testData.users = users;
    log('success', `Created ${users.length} users`);
    console.log('');

    // Tạo 3 tags/interests
    log('info', 'Creating 3 tags/interests...');
    const tagNames = ['music', 'travel', 'gaming'];
    const tags = [];

    for (const name of tagNames) {
      let tag = await Tag.findOne({ name });
      if (!tag) {
        tag = await Tag.create({ name, category: 'interest', status: 'active' });
      }
      tags.push(tag);
      log('success', `Tag: ${tag.name} (${tag._id})`);
    }

    testData.tags = tags;
    console.log('');

    // UserA thích UserB và UserC
    log('info', 'Creating swipe data (userA likes B and C)...');
    const userA = users[0];
    const userB = users[1];
    const userC = users[2];

    await Swipe.findOneAndUpdate(
      { swiperId: userA.userId, swipedId: userB.userId },
      { swiperId: userA.userId, swipedId: userB.userId, action: 'like' },
      { upsert: true, new: true }
    );
    log('success', 'userA liked userB');

    await Swipe.findOneAndUpdate(
      { swiperId: userA.userId, swipedId: userC.userId },
      { swiperId: userA.userId, swipedId: userC.userId, action: 'like' },
      { upsert: true, new: true }
    );
    log('success', 'userA liked userC');

    // userB thích userA (tạo match 1)
    await Swipe.findOneAndUpdate(
      { swiperId: userB.userId, swipedId: userA.userId },
      { swiperId: userB.userId, swipedId: userA.userId, action: 'like' },
      { upsert: true, new: true }
    );
    log('success', 'userB liked userA');

    // Tạo match 1: userA <-> userB
    const match1 = await Match.findMatch(userA.userId, userB.userId);
    if (!match1) {
      const newMatch = await Match.create({
        user1Id: userA.userId,
        user2Id: userB.userId,
        matchedAt: new Date(),
        isActive: true
      });
      testData.matches.push(newMatch);
      log('success', `Match 1 created: userA <-> userB`);
    } else {
      testData.matches.push(match1);
      log('success', `Match 1 exists: userA <-> userB`);
    }

    // userC thích userA (tạo match 2)
    await Swipe.findOneAndUpdate(
      { swiperId: userC.userId, swipedId: userA.userId },
      { swiperId: userC.userId, swipedId: userA.userId, action: 'like' },
      { upsert: true, new: true }
    );
    log('success', 'userC liked userA');

    // Tạo match 2: userA <-> userC
    const match2 = await Match.findMatch(userA.userId, userC.userId);
    if (!match2) {
      const newMatch = await Match.create({
        user1Id: userA.userId,
        user2Id: userC.userId,
        matchedAt: new Date(),
        isActive: true
      });
      testData.matches.push(newMatch);
      log('success', `Match 2 created: userA <-> userC`);
    } else {
      testData.matches.push(match2);
      log('success', `Match 2 exists: userA <-> userC`);
    }

    console.log('');
    log('data', `Summary:`);
    log('data', `  Users: ${users.length}`);
    log('data', `  Tags: ${tags.length}`);
    log('data', `  Matches: ${testData.matches.length}`);
    log('data', `  userA token: ${users[0].token.substring(0, 20)}...`);
    log('data', `  userB token: ${users[1].token.substring(0, 20)}...`);
    log('data', `  match1 ID: ${testData.matches[0]?._id}`);
    log('data', `  match2 ID: ${testData.matches[1]?._id}`);

    console.log('');
    return true;

  } catch (error) {
    log('fail', `Seed failed: ${error.message}`);
    return false;
  }
}

// ============================================
// FLOW A: PROFILE
// ============================================

async function flowProfile() {
  log('section', 'FLOW A: PROFILE', 'section');
  console.log('');

  const userA = testData.users[0];

  // A1: Lấy profile của chính mình
  log('step', 'A1: Get my profile');
  const res1 = await makeRequest('GET', '/profile', { token: userA.token });
  if (res1.ok) {
    log('success', 'Get my profile OK', 'success');
    log('data', `  Profile: ${res1.data.data?.fullName || res1.data.profile?.fullName}`);
  } else {
    log('fail', `Get my profile failed: ${res1.data.message}`);
  }

  // A2: Lấy profile của user khác bằng userId
  log('step', 'A2: Get userB profile by ID');
  const userB = testData.users[1];
  const res2 = await makeRequest('GET', `/users/${userB.userId}`, { token: userA.token });
  if (res2.ok) {
    log('success', 'Get userB profile OK', 'success');
    log('data', `  User: ${res2.data.username || res2.data.fullName}`);
  } else {
    log('fail', `Get userB profile failed: ${res2.data.message}`);
  }

  // A3: Get profile v1
  log('step', 'A3: Get profile via v1 endpoint');
  const res3 = await makeRequest('GET', `/v1/profiles/${userB.userId}`, { token: userA.token });
  if (res3.ok) {
    log('success', 'Get profile v1 OK', 'success');
  } else {
    log('fail', `Get profile v1 failed: ${res3.data.message}`);
  }

  // A4: Get full profile detail
  log('step', 'A4: Get full profile detail');
  const matchId = testData.matches[0]?._id;
  if (matchId) {
    const res4 = await makeRequest('GET', `/v1/profiles/${userB.userId}/full`, { token: userA.token });
    if (res4.ok) {
      log('success', 'Get full profile OK', 'success');
    } else {
      log('fail', `Get full profile failed: ${res4.data.message}`);
    }
  }

  console.log('');
}

// ============================================
// FLOW B: LIKE -> MATCH
// ============================================

async function flowLikeMatch() {
  log('section', 'FLOW B: LIKE -> MATCH', 'section');
  console.log('');

  const userD = testData.users[3];
  const userE = testData.users[4];

  // B1: userD likes userE
  log('step', 'B1: userD likes userE');
  const res1 = await makeRequest('POST', '/match/like', {
    token: userD.token,
    body: { userId: userE.userId }
  });

  if (res1.ok) {
    log('success', 'Like sent', 'success');
    log('data', `  matched: ${res1.data.matched || false}`);
    if (res1.data.matched) {
      log('data', `  matchId: ${res1.data.match?._id}`);
    }
  } else {
    log('fail', `Like failed: ${res1.data.message}`);
  }

  // B2: userE likes userD (tạo match)
  log('step', 'B2: userE likes userD');
  const res2 = await makeRequest('POST', '/match/like', {
    token: userE.token,
    body: { userId: userD.userId }
  });

  if (res2.ok) {
    log('success', 'Like sent', 'success');
    log('data', `  matched: ${res2.data.matched || false}`);
    if (res2.data.matched) {
      log('data', `  NEW MATCH CREATED!`);
      log('data', `  matchId: ${res2.data.match?._id}`);
      // Lưu match mới để test sau
      if (res2.data.match?._id) {
        testData.matches.push(res2.data.match);
      }
    }
  } else {
    log('fail', `Like failed: ${res2.data.message}`);
  }

  // B3: Verify match exists in DB
  log('step', 'B3: Verify match in database');
  const match = await Match.findMatch(userD.userId, userE.userId);
  if (match) {
    log('success', 'Match verified in DB', 'success');
    log('data', `  matchId: ${match._id}`);
    log('data', `  isActive: ${match.isActive}`);
  } else {
    log('fail', 'Match not found in DB');
  }

  console.log('');
}

// ============================================
// FLOW C: MATCH
// ============================================

async function flowMatch() {
  log('section', 'FLOW C: MATCH', 'section');
  console.log('');

  const userA = testData.users[0];

  // C1: Get all matches của userA
  log('step', 'C1: Get all matches');
  const res1 = await makeRequest('GET', '/users/matches', { token: userA.token });
  if (res1.ok) {
    log('success', 'Get matches OK', 'success');
    const matches = res1.data.matches || [];
    log('data', `  Total matches: ${matches.length}`);
    matches.forEach((m, i) => {
      const other = m.userId || m.otherUser;
      log('data', `  Match ${i + 1}: ${other?.fullName || other?.username || 'unknown'}`);
    });

    // Cập nhật testData.matches với matches từ API
    if (matches.length > 0 && matches[0]._id) {
      testData.matches = matches.map(m => ({ _id: m._id || m.matchId }));
    }
  } else {
    log('fail', `Get matches failed: ${res1.data.message}`);
  }

  // C2: Get mutual likes
  log('step', 'C2: Get mutual likes');
  const res2 = await makeRequest('GET', '/match/mutual', { token: userA.token });
  if (res2.ok) {
    log('success', 'Get mutual likes OK', 'success');
    const mutuals = res2.data.matches || [];
    log('data', `  Mutual likes: ${mutuals.length}`);
  } else {
    log('fail', `Get mutual likes failed: ${res2.data.message}`);
  }

  // C3: Get likes (người đã like mình)
  log('step', 'C3: Get users who liked me');
  const res3 = await makeRequest('GET', '/match/likes', { token: userA.token });
  if (res3.ok) {
    log('success', 'Get likes OK', 'success');
    const likes = res3.data.users || [];
    log('data', `  Users who liked me: ${likes.length}`);
  } else {
    log('fail', `Get likes failed: ${res3.data.message}`);
  }

  console.log('');
}

// ============================================
// FLOW D: MESSAGE
// ============================================

async function flowMessage() {
  log('section', 'FLOW D: MESSAGE', 'section');
  console.log('');

  const userA = testData.users[0];
  const userB = testData.users[1];
  
  // Lấy matchId từ testData
  const match = testData.matches.find(m => m._id);
  if (!match) {
    log('warn', 'No match found, creating one for message test');
    
    // Tạo match tạm
    await Swipe.findOneAndUpdate(
      { swiperId: userA.userId, swipedId: userB.userId },
      { swiperId: userA.userId, swipedId: userB.userId, action: 'like' },
      { upsert: true, new: true }
    );
    await Swipe.findOneAndUpdate(
      { swiperId: userB.userId, swipedId: userA.userId },
      { swiperId: userB.userId, swipedId: userA.userId, action: 'like' },
      { upsert: true, new: true }
    );
    
    let newMatch = await Match.findMatch(userA.userId, userB.userId);
    if (!newMatch) {
      newMatch = await Match.create({
        user1Id: userA.userId,
        user2Id: userB.userId,
        isActive: true
      });
    }
    testData.matches = [newMatch];
  }

  const matchId = testData.matches[0]._id;

  // D1: Get conversations
  log('step', 'D1: Get conversations');
  const res1 = await makeRequest('GET', '/messages/conversations', { token: userA.token });
  if (res1.ok) {
    log('success', 'Get conversations OK', 'success');
    const convs = res1.data.data || res1.data.conversations || [];
    log('data', `  Total conversations: ${convs.length}`);
  } else {
    log('fail', `Get conversations failed: ${res1.data.message}`);
  }

  // D2: Send message
  log('step', 'D2: Send message');
  const res2 = await makeRequest('POST', `/messages/${matchId}`, {
    token: userA.token,
    body: { content: 'Hello from test flow! This is a test message.' }
  });

  if (res2.ok) {
    log('success', 'Message sent OK', 'success');
    log('data', `  messageId: ${res2.data.message?._id}`);
  } else {
    log('fail', `Send message failed: ${res2.data.message}`);
  }

  // D3: Get messages
  log('step', 'D3: Get messages');
  const res3 = await makeRequest('GET', `/messages/${matchId}`, { token: userA.token });
  if (res3.ok) {
    log('success', 'Get messages OK', 'success');
    const msgs = res3.data.messages || res3.data.data || [];
    log('data', `  Total messages: ${msgs.length}`);
    if (msgs.length > 0) {
      log('data', `  Last message: ${msgs[msgs.length - 1].content?.substring(0, 50)}...`);
    }
  } else {
    log('fail', `Get messages failed: ${res3.data.message}`);
  }

  // D4: Send reply từ userB
  log('step', 'D4: Send reply from userB');
  const res4 = await makeRequest('POST', `/messages/${matchId}`, {
    token: userB.token,
    body: { content: 'Reply from userB! Test message received.' }
  });

  if (res4.ok) {
    log('success', 'Reply sent OK', 'success');
  } else {
    log('fail', `Reply failed: ${res4.data.message}`);
  }

  // D5: Mark as read
  log('step', 'D5: Mark messages as read');
  const res5 = await makeRequest('PUT', `/messages/${matchId}/read`, { token: userA.token });
  if (res5.ok) {
    log('success', 'Mark as read OK', 'success');
  } else {
    log('fail', `Mark as read failed: ${res5.data.message}`);
  }

  console.log('');
}

// ============================================
// FLOW E: INTEREST
// ============================================

async function flowInterest() {
  log('section', 'FLOW E: INTEREST', 'section');
  console.log('');

  const userA = testData.users[0];

  // E1: Get all tags
  log('step', 'E1: Get all tags');
  const res1 = await makeRequest('GET', '/tags', { token: userA.token });
  if (res1.ok) {
    log('success', 'Get tags OK', 'success');
    const tags = res1.data.tags || [];
    log('data', `  Total tags: ${tags.length}`);
    
    // Lưu tag IDs nếu chưa có
    if (testData.tags.length === 0 && tags.length > 0) {
      testData.tags = tags.slice(0, 3);
    }
  } else {
    log('fail', `Get tags failed: ${res1.data.message}`);
  }

  // E2: Get user interests
  log('step', 'E2: Get user interests');
  const res2 = await makeRequest('GET', '/users/interests', { token: userA.token });
  if (res2.ok) {
    log('success', 'Get interests OK', 'success');
    const interests = res2.data.interests || [];
    log('data', `  User interests: ${interests.length}`);
  } else {
    log('fail', `Get interests failed: ${res2.data.message}`);
  }

  // E3: Update user interests (thay thế toàn bộ)
  log('step', 'E3: Update user interests');
  const tagIds = testData.tags.map(t => t._id || t.name || t);
  const res3 = await makeRequest('POST', '/users/interests', {
    token: userA.token,
    body: { tags: tagIds }
  });

  if (res3.ok) {
    log('success', 'Update interests OK', 'success');
    log('data', `  Interests updated: ${res3.data.total || 0}`);
  } else {
    log('fail', `Update interests failed: ${res3.data.message}`);
  }

  // E4: Add single interest
  log('step', 'E4: Add single interest');
  const res4 = await makeRequest('POST', '/users/interests/add', {
    token: userA.token,
    body: { tag: 'cooking' }
  });

  if (res4.ok) {
    log('success', 'Add interest OK', 'success');
  } else {
    log('fail', `Add interest failed: ${res4.data.message}`);
  }

  // E5: Remove interest
  log('step', 'E5: Remove interest');
  // Lấy tagId từ UserTag
  const userTag = await UserTag.findOne({ userId: userA.userId });
  if (userTag) {
    const res5 = await makeRequest('DELETE', `/users/interests/${userTag.tagId}`, {
      token: userA.token
    });
    if (res5.ok) {
      log('success', 'Remove interest OK', 'success');
    } else {
      log('fail', `Remove interest failed: ${res5.data.message}`);
    }
  } else {
    log('warn', 'No userTag found to remove');
  }

  console.log('');
}

// ============================================
// FLOW F: REPORT / BLOCK
// ============================================

async function flowReportBlock() {
  log('section', 'FLOW F: REPORT / BLOCK', 'section');
  console.log('');

  const userA = testData.users[0];
  const userB = testData.users[1];

  // F1: Get report reasons
  log('step', 'F1: Get report reasons');
  const res1 = await makeRequest('GET', '/report/reasons', { token: userA.token });
  if (res1.ok) {
    log('success', 'Get reasons OK', 'success');
    const reasons = res1.data.reasons || [];
    log('data', `  Reasons: ${reasons.map(r => r.value || r).join(', ')}`);
  } else {
    log('fail', `Get reasons failed: ${res1.data.message}`);
  }

  // F2: Report userB
  log('step', 'F2: userA reports userB');
  const res2 = await makeRequest('POST', '/report', {
    token: userA.token,
    body: {
      targetId: userB.userId,
      reason: 'fake_profile',
      description: 'Test report from automated flow'
    }
  });

  if (res2.ok) {
    log('success', 'Report created OK', 'success');
  } else {
    // Có thể đã report rồi
    log('warn', `Report failed (may already reported): ${res2.data.message}`);
  }

  // F3: Block userB
  log('step', 'F3: userA blocks userB');
  const res3 = await makeRequest('POST', '/block', {
    token: userA.token,
    body: {
      targetId: userB.userId,
      reason: 'Test block from automated flow'
    }
  });

  if (res3.ok) {
    log('success', 'Block created OK', 'success');
  } else {
    log('warn', `Block failed: ${res3.data.message}`);
  }

  // F4: Get blocked users
  log('step', 'F4: Get blocked users');
  const res4 = await makeRequest('GET', '/block', { token: userA.token });
  if (res4.ok) {
    log('success', 'Get blocked users OK', 'success');
    const blocked = res4.data.data || res4.data.blocked || [];
    log('data', `  Blocked users: ${blocked.length}`);
  } else {
    log('fail', `Get blocked users failed: ${res4.data.message}`);
  }

  // F5: Unblock userB
  log('step', 'F5: userA unblocks userB');
  const res5 = await makeRequest('DELETE', `/block/${userB.userId}`, {
    token: userA.token
  });

  if (res5.ok) {
    log('success', 'Unblock OK', 'success');
  } else {
    log('warn', `Unblock failed: ${res5.data.message}`);
  }

  console.log('');
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(15) + 'TEST FLOW SCRIPT' + ' '.repeat(22) + '║');
  console.log('╚' + '═'.repeat(58) + '╝\n');

  log('info', `Base URL: ${BASE_URL}`);
  log('info', `Time: ${new Date().toISOString()}`);
  console.log('');

  // Phase 0: Seed data
  const seeded = await seedDatabase();
  if (!seeded) {
    log('fail', 'Cannot proceed without seed data');
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  // Phase A: Profile
  await flowProfile();

  console.log('═'.repeat(60) + '\n');

  // Phase B: Like -> Match
  await flowLikeMatch();

  console.log('═'.repeat(60) + '\n');

  // Phase C: Match
  await flowMatch();

  console.log('═'.repeat(60) + '\n');

  // Phase D: Message
  await flowMessage();

  console.log('═'.repeat(60) + '\n');

  // Phase E: Interest
  await flowInterest();

  console.log('═'.repeat(60) + '\n');

  // Phase F: Report / Block
  await flowReportBlock();

  console.log('═'.repeat(60) + '\n');

  // Summary
  log('section', 'SUMMARY', 'section');
  console.log('');
  log('data', `Test users created: ${testData.users.length}`);
  log('data', `Test tags created: ${testData.tags.length}`);
  log('data', `Matches: ${testData.matches.length}`);
  console.log('');

  log('success', 'TEST FLOW COMPLETED!', 'success');

  // Disconnect
  await mongoose.disconnect();
  log('info', 'Disconnected from MongoDB');
  process.exit(0);
}

main().catch(error => {
  log('fail', `Fatal error: ${error.message}`);
  console.error(error);
  mongoose.disconnect();
  process.exit(1);
});
