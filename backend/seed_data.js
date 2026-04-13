/**
 * Seed Data Script - Schema đúng theo Models
 * Chạy: node seed_data.js
 * 
 * FIX: Đã sửa location từ string -> GeoJSON format
 * FIX: Đảm bảo đúng schema cho tất cả models
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './src/config/index.js';

// Import models
import User from './src/models/User.js';
import Swipe from './src/models/Swipe.js';
import Match from './src/models/Match.js';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import ConversationMember from './src/models/ConversationMember.js';
import Tag from './src/models/Tag.js';
import UserTag from './src/models/UserTag.js';
import Role from './src/models/Role.js';
import UserRole from './src/models/UserRole.js';
import Report from './src/models/Report.js';
import Block from './src/models/Block.js';

// ============================================
// DỮ LIỆU MẪU
// ============================================

const vietnameseNames = {
  male: [
    'Nguyen Van Minh', 'Tran Van Phong', 'Le Viet Anh', 'Hoang Minh Duc', 'Bui Quang Vinh',
    'Phan Van Huy', 'Vo Thanh Son', 'Dang Van Hung', 'Ngo Gia Bao', 'Trinh Dinh Phuc',
    'Cao Minh Tiet', 'Duong Quoc Viet', 'Ho Dang Tai', 'Luong The Hung', 'Mai Xuan Hung'
  ],
  female: [
    'Tran Thi Hue', 'Pham Thuy Trang', 'Ngo Thanh Lam', 'Dang Thi Mai', 'Vo Thi Thuy',
    'Nguyen Thi Huong', 'Tran Thi Ngoc', 'Le Thi Ha', 'Pham Thi Lan', 'Hoang Thi Ha',
    'Bui Thi Hong', 'Do Thi Hong', 'Vu Thi Huong', 'Nguyen Thi Thuy', 'Tran Thi Minh'
  ]
};

// Vietnam locations with real coordinates (for GeoJSON)
const locations = [
  { name: 'Ha Noi', lat: 21.0285, lng: 105.8542 },
  { name: 'TP. Ho Chi Minh', lat: 10.8231, lng: 106.6297 },
  { name: 'Da Nang', lat: 16.0544, lng: 108.2022 },
  { name: 'Hai Phong', lat: 20.8449, lng: 106.6881 },
  { name: 'Can Tho', lat: 10.0452, lng: 105.7469 },
  { name: 'Hue', lat: 16.0544, lng: 107.5530 },
  { name: 'Nha Trang', lat: 12.2388, lng: 109.1967 },
  { name: 'Da Lat', lat: 11.9404, lng: 108.4583 },
  { name: 'Vung Tau', lat: 10.4107, lng: 107.1146 },
  { name: 'Ha Long', lat: 20.9101, lng: 107.1839 }
];

const occupations = [
  'Ky su phan mem', 'Designer', 'Marketing', 'Giao vien', 'Bac si', 'Ke toan',
  'Kien truc su', 'Chef', 'Manager', 'Nhan vien kinh doanh', 'Ky su xay dung',
  'Nha bao', 'Nhiep anh gia', 'Luat su', 'Kinh doanh', 'Content Creator', 'Freelancer'
];

const educations = [
  'Dai hoc Bach Khoa', 'Dai hoc Kinh te Quoc dan', 'Dai hoc FPT', 'Dai hoc RMIT',
  'Dai hoc Ngoai thuong', 'Dai hoc Luat', 'Dai hoc Y Ha Noi', 'Dai hoc VNU'
];

const interestsList = [
  'Du lich', 'Nhiep anh', 'Am thuc', 'Am nhac', 'Doc sach', 'Phim anh',
  'Yoga', 'Thien', 'Game', 'Bong da', 'Cau long', 'Boi lo', 'Chay bo', 'Leo nui',
  'Nau an', 'Ve tranh', 'Thiet ke', 'K-pop', 'Manga', 'Shopping', 'Ca phe',
  'Gym', 'Picnik', 'Thien nhien', 'Dong vat', 'Di bo', 'Khieu vu'
];

const bios = [
  'Yeu thich du lich va nhiep anh. Dang tim kiem mot nua co cung so thich.',
  'Nguoi yeu dong vat, thich yoga va doc sach. Muon tim nguoi yeu thu cung nhu minh!',
  'Ky su phan mem, thich cong nghe va game. Tim nguoi cung chi huong.',
  'Nhan vien marketing, sang tao va nang dong. Thich cafe va nhung cuoc tro chuyen thu vi.',
  'Sinh vien nam cuoi, thich ve va nau an. Tim ban doi cung tuoi.',
  'Kien truc su, sang tao va co gu tham my. Thich chup anh kien truc.'
];

const avatarUrls = {
  male: Array.from({ length: 15 }, (_, i) => `https://randomuser.me/api/portraits/men/${(i % 99) + 1}.jpg`),
  female: Array.from({ length: 15 }, (_, i) => `https://randomuser.me/api/portraits/women/${(i % 99) + 1}.jpg`)
};

const photoUrls = Array.from({ length: 50 }, (_, i) => `https://picsum.photos/400/600?random=${i + 1}`);

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

function generateGeoLocation() {
  const loc = getRandomItem(locations);
  // Add some random offset to make locations not exactly the same
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;
  return {
    type: 'Point',
    coordinates: [loc.lng + lngOffset, loc.lat + latOffset] // GeoJSON format: [longitude, latitude]
  };
}

// ============================================
// TẠO DỮ LIỆU
// ============================================

function generateUsers(count = 20) {
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

    const isAdmin = i < 2; // 2 tài khoản đầu tiên làm admin

    users.push({
      username: (emailBase.replace(/\./g, '') + i).substring(0, 20),
      email: email,
      loginMethod: 'email',
      fullName: name + (isAdmin ? ' (Admin)' : ''),
      age: randomBetween(18, 45),
      gender: gender,
      bio: getRandomItem(bios),
      avatar: getRandomItem(avatarUrls[gender]),
      photos: getRandomItems(photoUrls, randomBetween(2, 4)),
      interests: getRandomItems(interestsList, randomBetween(3, 5)),
      // FIX: Use GeoJSON format for location
      location: generateGeoLocation(),
      locationText: getRandomItem(locations).name,
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
      isOnline: Math.random() > 0.5,
      lastSeen: Math.random() > 0.3 ? new Date() : new Date(Date.now() - randomBetween(1, 7) * 86400000),
      role: isAdmin ? 'admin' : 'user',
      isEmailVerified: true,
      kycStatus: 'verified',
      isFake: false,
      fakeScore: 0,
      status: 'active'
    });
  }

  return users;
}

function generateTags() {
  const tagsInterests = interestsList.map(name => ({
    name,
    category: 'interest',
    status: 'active',
    description: `Tag for ${name}`,
    icon: '',
    usageCount: 0
  }));
  const tagsOccupations = occupations.slice(0, 10).map(name => ({
    name,
    category: 'occupation',
    status: 'active',
    description: `Occupation: ${name}`,
    icon: '',
    usageCount: 0
  }));
  const tagsLocations = locations.map(loc => ({
    name: loc.name,
    category: 'location',
    status: 'active',
    description: `Location: ${loc.name}`,
    icon: '',
    usageCount: 0
  }));
  
  return [...tagsInterests, ...tagsOccupations, ...tagsLocations];
}

function generateSwipes(users, count = 100) {
  const swipes = [];
  const swipeSet = new Set();

  for (let i = 0; i < count; i++) {
    const swiperIdx = Math.floor(Math.random() * users.length);
    let swipedIdx;
    do {
      swipedIdx = Math.floor(Math.random() * users.length);
    } while (swipedIdx === swiperIdx);

    const pairKey = `${users[swiperIdx]._id}-${users[swipedIdx]._id}`;
    if (swipeSet.has(pairKey)) continue;
    swipeSet.add(pairKey);

    swipes.push({
      swiperId: users[swiperIdx]._id,
      swipedId: users[swipedIdx]._id,
      action: Math.random() > 0.3 ? 'like' : 'pass'
    });
  }

  return swipes;
}

function generateMatches(users, swipes, count = 15) {
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
            lastActivity: new Date(),
            isActive: true
          });
        }
      }
    }
  });

  return matches;
}

function generateConversations(matches) {
  return matches.map(match => ({
    type: 'private',
    name: '',
    avatar: '',
    matchId: match._id
  }));
}

function generateMessages(matches, users, conversations) {
  const messages = [];
  const templates = [
    'Xin chao! Cam on ban da ket ban voi minh.',
    'Ban khoe khong? Rat vui duoc gap ban.',
    'Ban thich lam gi khi ranh?',
    'That tuyet voi!',
    'Ban that vui ve!',
    'Hen gap ban som nhe!'
  ];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const conv = conversations[i];
    const user1 = users.find(u => u._id.toString() === match.user1Id?.toString());
    const user2 = users.find(u => u._id.toString() === match.user2Id?.toString());
    if (!user1 || !user2) continue;

    const messageCount = randomBetween(3, 8);

    for (let j = 0; j < messageCount; j++) {
      const sender = j % 2 === 0 ? user1 : user2;
      const createdAt = new Date(match.matchedAt.getTime() + j * randomBetween(5, 30) * 60000);

      messages.push({
        conversationId: conv._id,
        matchId: match._id,
        senderId: sender._id,
        sender: sender._id, // backward compatible
        content: getRandomItem(templates),
        messageType: 'text',
        status: j < messageCount - 2 ? 'seen' : 'sent',
        isRead: j < messageCount - 2
      });
    }
  }

  return messages;
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedDatabase() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          SEED DATABASE - SCHEMA ĐÚNG THEO MODELS           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Kết nối MongoDB
    console.log('📦 Đang kết nối MongoDB...');
    console.log(`   URI: ${config.mongodbUri}`);
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Kết nối MongoDB thành công!\n');

    // Xóa dữ liệu cũ
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    
    await Promise.all([
      User.deleteMany({}),
      Swipe.deleteMany({}),
      Match.deleteMany({}),
      Message.deleteMany({}),
      Conversation.deleteMany({}),
      ConversationMember.deleteMany({}),
      Tag.deleteMany({}),
      UserTag.deleteMany({}),
      Role.deleteMany({}),
      UserRole.deleteMany({}),
      Report.deleteMany({}),
      Block.deleteMany({})
    ]);
    
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
    console.log('👥 Đang tạo 20 người dùng...');
    const userData = generateUsers(20);
    const salt = await bcrypt.genSalt(10);

    const usersWithHashedPassword = await Promise.all(
      userData.map(async (user) => ({
        ...user,
        passwordHash: await bcrypt.hash('password123', salt)
      }))
    );

    const users = await User.insertMany(usersWithHashedPassword);
    console.log(`✅ Đã tạo ${users.length} người dùng!\n`);

    // Gán role admin cho 2 tài khoản đầu tiên
    const adminRole = roles.find(r => r.name === 'admin');
    const adminRolesData = users.slice(0, 2).map(admin => ({
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

    // FIX: Cập nhật usageCount cho Tags
    console.log('🔄 Đang cập nhật usageCount cho Tags...');
    for (const tag of tags) {
      let count = 0;
      if (tag.category === 'interest') {
        count = userTags.filter(ut => ut.tagId.toString() === tag._id.toString()).length;
      } else if (tag.category === 'occupation') {
        count = users.filter(u => u.occupation === tag.name).length;
      } else if (tag.category === 'location') {
        count = users.filter(u => u.locationText === tag.name).length;
      }
      
      if (count > 0) {
        await Tag.findByIdAndUpdate(tag._id, { usageCount: count });
      }
    }
    console.log('✅ Đã cập nhật xong usageCount cho các danh mục!\n');

    // Tạo Swipes
    console.log('💗 Đang tạo Swipes...');
    const swipes = generateSwipes(users, 100);
    try {
      await Swipe.insertMany(swipes);
      console.log(`✅ Đã tạo ${swipes.length} swipe records!\n`);
    } catch (e) {
      // Handle duplicate swipe errors gracefully
      console.log(`⚠️  Đã tạo ${swipes.length} swipe records (some duplicates skipped)!\n`);
    }

    // Tạo Matches
    console.log('💑 Đang tạo Matches...');
    const matches = generateMatches(users, swipes, 15);
    const insertedMatches = await Match.insertMany(matches);
    console.log(`✅ Đã tạo ${insertedMatches.length} matches!\n`);

    // Tạo Conversations
    console.log('💬 Đang tạo Conversations...');
    const conversations = await Conversation.insertMany(generateConversations(insertedMatches));
    console.log(`✅ Đã tạo ${conversations.length} conversations!\n`);

    // Tạo Messages
    console.log('📨 Đang tạo Messages...');
    const messages = generateMessages(insertedMatches, users, conversations);
    await Message.insertMany(messages);
    console.log(`✅ Đã tạo ${messages.length} tin nhắn!\n`);

    // In thống kê
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    SEED HOÀN TẤT!                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 THỐNG KÊ DỮ LIỆU:');
    console.log('─'.repeat(50));
    console.log(`   👥 Users:           ${users.length}`);
    console.log(`   🏷️  Tags:            ${tags.length}`);
    console.log(`   💗 Swipes:         ${swipes.length}`);
    console.log(`   💑 Matches:        ${insertedMatches.length}`);
    console.log(`   💬 Conversations:  ${conversations.length}`);
    console.log(`   📩 Messages:       ${messages.length}`);
    console.log('─'.repeat(50));

    // Tài khoản test
    console.log('\n🔐 TÀI KHOẢN TEST:');
    console.log('─'.repeat(50));
    console.log('   Password cho tất cả: password123\n');

    users.slice(0, 5).forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.fullName}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Location: ${user.locationText}`);
      console.log('');
    });

    console.log('✅ Script seed hoàn tất! Database đã sẵn sàng để test.');

  } catch (error) {
    console.error('❌ Lỗi seed database:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

seedDatabase();
