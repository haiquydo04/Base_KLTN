/**
 * Seed Database Script - Schema Mới
 * Chạy: node seed.js
 * Seed đầy đủ dữ liệu mẫu cho schema mới
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './src/config/index.js';

// Import models mới
import User from './src/models/User.js';
import Swipe from './src/models/Swipe.js';
import Match from './src/models/Match.js';
import Message from './src/models/Message.js';
import VideoCall from './src/models/VideoCall.js';
import Conversation from './src/models/Conversation.js';
import ConversationMember from './src/models/ConversationMember.js';
import Tag from './src/models/Tag.js';
import UserTag from './src/models/UserTag.js';
import SavedFilter from './src/models/SavedFilter.js';
import AdminLog from './src/models/AdminLog.js';
import Role from './src/models/Role.js';
import UserRole from './src/models/UserRole.js';

// ============================================
// DỮ LIỆU MẪU
// ============================================

const vietnameseNames = {
  male: [
    'Nguyen Van Minh', 'Tran Van Phong', 'Le Viet Anh', 'Hoang Minh Duc', 'Bui Quang Vinh',
    'Phan Van Huy', 'Vo Thanh Son', 'Dang Van Hung', 'Ngo Gia Bao', 'Trinh Dinh Phuc',
    'Cao Minh Tiet', 'Duong Quoc Viet', 'Ho Dang Tai', 'Luong The Hung', 'Mai Xuan Hung',
    'Nguyen Hoang Long', 'Tran Quoc Trung', 'Le Hong Phuc', 'Pham Gia Khiem', 'Do Ngoc Hung',
    'Nguyen Quang Hieu', 'Tran Manh Cuong', 'Le Van Tai', 'Pham Tuan Anh', 'Hoang Van Nam'
  ],
  female: [
    'Tran Thi Hue', 'Pham Thuy Trang', 'Ngo Thanh Lam', 'Dang Thi Mai', 'Vo Thi Thuy',
    'Nguyen Thi Huong', 'Tran Thi Ngoc', 'Le Thi Ha', 'Pham Thi Lan', 'Hoang Thi Ha',
    'Bui Thi Hong', 'Do Thi Hong', 'Vu Thi Huong', 'Nguyen Thi Thuy', 'Tran Thi Minh',
    'Le Thi Ngoc', 'Pham Thi Hang', 'Hoang Thi Mai', 'Nguyen Thi Lan', 'Tran Thi Hanh',
    'Nguyen Thu Ha', 'Tran Thi Thu', 'Pham Ngoc Linh', 'Hoang Thi Phuong', 'Bui Ngoc Diep'
  ]
};

const locations = [
  'Ha Noi', 'TP. Ho Chi Minh', 'Da Nang', 'Hai Phong', 'Can Tho',
  'Hue', 'Nha Trang', 'Da Lat', 'Vung Tau', 'Ha Long'
];

const occupations = [
  'Ky su phan mem', 'Designer', 'Marketing', 'Giao vien', 'Bac si', 'Ke toan',
  'Kien truc su', 'Chef', 'Manager', 'Nhan vien kinh doanh', 'Ky su xay dung',
  'Nha bao', 'Nhiep anh gia', 'Luat su', 'Kinh doanh', 'Y ta', 'Nha thiet ke noi that',
  'Content Creator', 'Sinh vien', 'Freelancer', 'Giam doc', 'Truong phong', 'Ketoan'
];

const educations = [
  'Dai hoc Bach Khoa', 'Dai hoc Kinh te Quoc dan', 'Dai hoc FPT', 'Dai hoc RMIT',
  'Dai hoc Ngoai thuong', 'Dai hoc Luat', 'Dai hoc Y Ha Noi', 'Dai hoc Kien truc',
  'Dai hoc Khoa hoc Tu nhien', 'Dai hoc Cong nghiep', 'Dai hoc Thuong mai',
  'Hoc vien Tai chinh', 'Dai hoc VNU', 'Dai hoc BKHN', 'Dai hoc AUA'
];

const interestsList = [
  'Du lich', 'Nhiep anh', 'Am thuc', 'Am nhac', 'Doc sach', 'Phim anh',
  'Yoga', 'Thien', 'Game', 'Bong da', 'Cau long', 'Boi lo', 'Chay bo', 'Leo nui',
  'Nau an', 'Ve tranh', 'Thiet ke', 'K-pop', 'Manga', 'Shopping', 'Ca phe', 'Ruou vang',
  'Gym', 'Golf', 'Picnik', 'Thien nhien', 'Dong vat', 'Di bo', 'Khieu vu', 'Viet blog'
];

const bios = [
  'Yeu thich du lich va nhiep anh. Dang tim kiem mot nua co cung so thich.',
  'Nguoi yeu dong vat, thich yoga va doc sach. Muon tim nguoi yeu thu cung nhu minh!',
  'Ky su phan mem, thich cong nghe va game. Tim nguoi cung chi huong.',
  'Nhan vien marketing, sang tao va nang dong. Thich cafe va nhung cuoc tro chuyen thu vi.',
  'Doanh nhan, thich golf va polo. Tim nguoi co loi song lanh manh.',
  'Sinh vien nam cuoi, thich ve va nau an. Tim ban doi cung tuoi.',
  'Kien truc su, sang tao va co gu tham my. Thich chup anh kien truc.',
  'Bac si, ban ron nhung van muon tim tinh yeu. Thich yoga va thien.',
  'Giao Vien my thuat, sang tao va yeu nghe thuat. Thich suu tap tranh.',
  'Manager trong cong ty IT, thich the thao va adventure. Tim nguoi nang dong.'
];

const avatarUrls = [
  ...Array.from({ length: 25 }, (_, i) => `https://randomuser.me/api/portraits/men/${i + 1}.jpg`),
  ...Array.from({ length: 25 }, (_, i) => `https://randomuser.me/api/portraits/women/${i + 1}.jpg`)
];

const photoUrls = [
  ...Array.from({ length: 100 }, (_, i) => `https://picsum.photos/400/600?random=${i + 1}`)
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// TẠO DỮ LIỆU
// ============================================

function generateUsers(count = 50) {
  const users = [];
  const usedNames = new Set();
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const gender = i % 2 === 0 ? 'male' : 'female';
    let name;
    do {
      name = getRandomItem(vietnameseNames[gender]);
    } while (usedNames.has(name));
    usedNames.add(name);

    let email;
    let emailBase = name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\s+/g, '.').replace(/\.+/g, '.');
    do {
      email = `${emailBase}${i}@email.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const isFake = i >= 45 && i < 50;
    const isAdmin = i < 3; // 3 tài khoản đầu tiên làm admin

    users.push({
      username: (emailBase.replace(/\./g, '') + i).substring(0, 20),
      email: email,
      passwordHash: '$2a$10$rQZ8K7rFzQvN5wQvN5wQvO', // placeholder - sẽ được hash lại
      loginMethod: 'email',
      fullName: name + (isAdmin ? ' (Admin)' : ''),
      age: randomBetween(18, 45),
      gender: gender,
      bio: getRandomItem(bios),
      avatar: avatarUrls[i % avatarUrls.length],
      photos: getRandomItems(photoUrls, randomBetween(2, 5)),
      interests: getRandomItems(interestsList, randomBetween(3, 6)),
      locationText: getRandomItem(locations),
      occupation: getRandomItem(occupations),
      education: getRandomItem(educations),
      height: gender === 'male' ? randomBetween(165, 185) : randomBetween(150, 170),
      drinking: getRandomItem(['never', 'sometimes', 'often', '']),
      smoking: getRandomItem(['never', 'sometimes', 'often', '']),
      lookingFor: getRandomItem(['relationship', 'friendship', 'casual']),
      preferences: {
        minAge: randomBetween(18, 25),
        maxAge: randomBetween(30, 50),
        gender: gender === 'male' ? 'female' : 'male'
      },
      isOnline: Math.random() > 0.6,
      lastSeen: Math.random() > 0.5 ? new Date() : new Date(Date.now() - randomBetween(1, 7) * 86400000),
      role: isAdmin ? 'admin' : 'user',
      isEmailVerified: true,
      kycStatus: 'verified',
      isFake: isFake,
      fakeScore: isFake ? randomBetween(50, 90) : 0,
      status: 'active'
    });
  }

  return users;
}

function generateTags() {
  const tagsInterests = interestsList.map(name => ({ name, category: 'interest', status: 'active' }));
  const tagsOccupations = occupations.map(name => ({ name, category: 'occupation', status: 'active' }));
  const tagsLocations = locations.map(name => ({ name, category: 'location', status: 'active' }));
  
  return [...tagsInterests, ...tagsOccupations, ...tagsLocations];
}

function generateSwipes(users, count = 300) {
  const swipes = [];
  const swipeSet = new Set();

  for (let i = 0; i < count; i++) {
    const swiper = users[randomBetween(0, users.length - 1)];
    let swiped;
    do {
      swiped = users[randomBetween(0, users.length - 1)];
    } while (swiped._id.toString() === swiper._id.toString());

    const pairKey = `${swiper._id}-${swiped._id}`;
    if (swipeSet.has(pairKey)) continue;
    swipeSet.add(pairKey);

    swipes.push({
      swiperId: swiper._id,
      swipedId: swiped._id,
      action: Math.random() > 0.3 ? 'like' : 'pass'
    });
  }

  return swipes;
}

function generateMatches(users, swipes, count = 30) {
  const matches = [];
  const matchSet = new Set();

  // Tạo match từ mutual likes
  const likePairs = new Set();
  swipes.forEach(swipe => {
    if (swipe.action === 'like') {
      likePairs.add(`${swipe.swiperId}-${swipe.swipedId}`);
    }
  });

  swipes.forEach(swipe => {
    if (swipe.action === 'like') {
      const reverseKey = `${swipe.swipedId}-${swipe.swiperId}`;
      if (likePairs.has(reverseKey)) {
        const [id1, id2] = [swipe.swiperId.toString(), swipe.swipedId.toString()].sort();
        const pairKey = `${id1}-${id2}`;
        if (!matchSet.has(pairKey) && matches.length < count) {
          matchSet.add(pairKey);
          matches.push({
            user1Id: swipe.swiperId,
            user2Id: swipe.swipedId,
            matchedAt: new Date(Date.now() - randomBetween(1, 30) * 86400000),
            isActive: true
          });
        }
      }
    }
  });

  // Thêm match ngẫu nhiên
  while (matches.length < count) {
    const user1 = users[randomBetween(0, users.length - 1)];
    const user2 = users[randomBetween(0, users.length - 1)];
    if (user1._id.toString() === user2._id.toString()) continue;

    const [id1, id2] = [user1._id.toString(), user2._id.toString()].sort();
    const pairKey = `${id1}-${id2}`;
    if (matchSet.has(pairKey)) continue;
    matchSet.add(pairKey);

    matches.push({
      user1Id: user1._id,
      user2Id: user2._id,
      matchedAt: new Date(Date.now() - randomBetween(1, 30) * 86400000),
      isActive: Math.random() > 0.2
    });
  }

  return matches;
}

function generateMessages(matches, users) {
  const messages = [];
  const templates = [
    'Xin chao! Cam on ban da ket ban voi minh.',
    'Ban khoe khong? Rat vui duoc gap ban.',
    'Ban thich lam gi khi ranh?',
    'That tuyet voi!',
    'Ban that vui ve!',
    'Tam biet nhe! Hen gap lai ban som.'
  ];

  matches.forEach(match => {
    const user1 = users.find(u => u._id.toString() === match.user1Id?.toString());
    const user2 = users.find(u => u._id.toString() === match.user2Id?.toString());
    if (!user1 || !user2) return;

    const messageCount = randomBetween(3, 10);

    for (let i = 0; i < messageCount; i++) {
      const sender = i % 2 === 0 ? user1 : user2;
      const createdAt = new Date(match.matchedAt.getTime() + i * randomBetween(5, 30) * 60000);

      messages.push({
        matchId: match._id,
        senderId: sender._id,
        sender: sender._id,
        content: getRandomItem(templates),
        messageType: 'text',
        isRead: i < messageCount - 2,
        status: i < messageCount - 2 ? 'seen' : 'sent'
      });
    }
  });

  return messages;
}

function generateVideoCalls(matches, users, count = 20) {
  const videoCalls = [];

  for (let i = 0; i < count; i++) {
    const match = matches[randomBetween(0, matches.length - 1)];
    const caller = users.find(u => u._id.toString() === match.user1Id?.toString());
    const receiver = users.find(u => u._id.toString() === match.user2Id?.toString());
    if (!caller || !receiver) continue;

    const startedAt = new Date(match.matchedAt.getTime() - randomBetween(1, 24) * 3600000);
    const duration = randomBetween(60, 600);

    videoCalls.push({
      callerId: caller._id,
      receiverId: receiver._id,
      startedAt,
      endedAt: new Date(startedAt.getTime() + duration * 1000),
      duration,
      matchRequested: Math.random() > 0.6,
      matchAccepted: Math.random() > 0.5,
      status: Math.random() > 0.3 ? 'connected' : 'missed'
    });
  }

  return videoCalls;
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedDatabase() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          SEED DATABASE - SCHEMA MỚI                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Kết nối MongoDB
    console.log('📦 Đang kết nối MongoDB...');
    console.log(`   URI: ${config.mongodbUri}`);
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Kết nối MongoDB thành công!\n');

    // Xóa dữ liệu cũ
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    
    // Xóa collections
    await Promise.all([
      User.deleteMany({}),
      Swipe.deleteMany({}),
      Match.deleteMany({}),
      Message.deleteMany({}),
      VideoCall.deleteMany({}),
      Conversation.deleteMany({}),
      ConversationMember.deleteMany({}),
      Tag.deleteMany({}),
      UserTag.deleteMany({}),
      SavedFilter.deleteMany({}),
      AdminLog.deleteMany({}),
      Role.deleteMany({}),
      UserRole.deleteMany({})
    ]);
    
    // Xóa indexes cũ (nếu có)
    try {
      await User.collection.dropIndexes();
      await Tag.collection.dropIndexes();
      await Role.collection.dropIndexes();
    } catch (e) {
      // Ignore if indexes don't exist
    }
    
    console.log('✅ Đã xóa toàn bộ dữ liệu cũ!\n');

    // Tạo Roles
    console.log('🔐 Đang tạo Roles...');
    const roles = await Role.insertMany([
      { name: 'user', description: 'Regular user', permissions: ['read', 'write'] },
      { name: 'premium', description: 'Premium user', permissions: ['read', 'write', 'premium_features'] },
      { name: 'admin', description: 'Administrator', permissions: ['read', 'write', 'delete', 'admin'] }
    ]);
    console.log(`✅ Đã tạo ${roles.length} roles!\n`);

    // Tạo Tags
    console.log('🏷️  Đang tạo Tags...');
    const tags = await Tag.insertMany(generateTags());
    console.log(`✅ Đã tạo ${tags.length} tags!\n`);

    // Tạo Users
    console.log('👥 Đang tạo 50 người dùng...');
    const userData = generateUsers(50);
    const salt = await bcrypt.genSalt(10);

    const usersWithHashedPassword = await Promise.all(
      userData.map(async (user) => ({
        ...user,
        passwordHash: await bcrypt.hash('password123', salt)
      }))
    );

    const users = await User.insertMany(usersWithHashedPassword);
    console.log(`✅ Đã tạo ${users.length} người dùng!\n`);

    // Gán role admin cho 3 tài khoản đầu tiên
    const adminRole = roles.find(r => r.name === 'admin');
    const adminRolesData = users.slice(0, 3).map(admin => ({
      userId: admin._id,
      roleId: adminRole._id
    }));
    await UserRole.insertMany(adminRolesData);

    // Tạo UserTags
    console.log('🏷️  Đang tạo UserTags...');
    const userTags = [];
    for (const user of users) {
      const userInterests = getRandomItems(interestsList, randomBetween(2, 5));
      for (const interest of userInterests) {
        const tag = tags.find(t => t.name === interest);
        if (tag) {
          userTags.push({
            userId: user._id,
            tagId: tag._id
          });
        }
      }
    }
    await UserTag.insertMany(userTags);
    console.log(`✅ Đã tạo ${userTags.length} user tags!\n`);

    // Tạo Swipes (PB09)
    console.log('💗 Đang tạo Swipes (PB09)...');
    const swipes = generateSwipes(users, 300);
    await Swipe.insertMany(swipes);
    console.log(`✅ Đã tạo ${swipes.length} swipe records!\n`);

    // Tạo Matches
    console.log('💑 Đang tạo Matches...');
    const matches = generateMatches(users, swipes, 35);
    const insertedMatches = await Match.insertMany(matches);
    console.log(`✅ Đã tạo ${insertedMatches.length} matches!\n`);

    // Tạo Messages
    console.log('💬 Đang tạo Messages...');
    const messages = generateMessages(insertedMatches, users);
    await Message.insertMany(messages);
    console.log(`✅ Đã tạo ${messages.length} tin nhắn!\n`);

    // Tạo VideoCalls (PB10)
    console.log('📹 Đang tạo VideoCalls (PB10)...');
    const videoCalls = generateVideoCalls(insertedMatches, users, 25);
    await VideoCall.insertMany(videoCalls);
    console.log(`✅ Đã tạo ${videoCalls.length} video calls!\n`);

    // Tạo AdminLogs
    console.log('📋 Đang tạo AdminLogs...');
    const adminLogs = [];
    const adminUsers = users.slice(0, 3);
    const actions = ['delete_user', 'verify_user', 'ban_user', 'unban_user', 'view_reports'];
    for (let i = 0; i < 15; i++) {
      const target = users[randomBetween(3, users.length - 1)]; // Không trỏ đến admin
      const randomAdmin = getRandomItem(adminUsers);
      adminLogs.push({
        adminId: randomAdmin._id,
        action: getRandomItem(actions),
        targetId: target._id,
        description: 'Test admin action',
        deviceInfo: 'Chrome on Windows'
      });
    }
    await AdminLog.insertMany(adminLogs);
    console.log(`✅ Đã tạo ${adminLogs.length} admin logs!\n`);

    // In thống kê
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    SEED HOÀN TẤT!                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 THỐNG KÊ DỮ LIỆU:');
    console.log('─'.repeat(50));
    console.log(`   👥 Users:           ${users.length}`);
    console.log(`   🏷️  Tags:            ${tags.length}`);
    console.log(`   💗 Swipes:         ${swipes.length}`);
    console.log(`   💑 Matches:        ${insertedMatches.length}`);
    console.log(`   💬 Messages:      ${messages.length}`);
    console.log(`   📹 VideoCalls:     ${videoCalls.length}`);
    console.log(`   📋 AdminLogs:      ${adminLogs.length}`);
    console.log('─'.repeat(50));

    // Tài khoản test
    console.log('\n🔐 TÀI KHOẢN TEST:');
    console.log('─'.repeat(50));
    console.log('   (Password: password123)\n');

    users.slice(0, 5).forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.fullName}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Role: ${user.role}\n`);
    });

    console.log('✅ Script seed hoàn tất! Database đã sẵn sàng để phát triển.');

  } catch (error) {
    console.error('❌ Lỗi seed database:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

seedDatabase();
