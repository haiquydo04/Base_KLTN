import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './src/config/index.js';
import User from './src/models/User.js';
import Match from './src/models/Match.js';
import Message from './src/models/Message.js';

const vietnameseNames = {
  male: ['Nguyen Van Minh', 'Tran Van Phong', 'Le Viet Anh', 'Hoang Minh Duc', 'Bui Quang Vinh',
    'Phan Van Huy', 'Vo Thanh Son', 'Dang Van Hung', 'Ngo Gia Bao', 'Trinh Dinh Phuc',
    'Cao Minh Tiet', 'Duong Quoc Viet', 'Ho Dang Tai', 'Luong The Hung', 'Mai Xuan Hung',
    'Nguyen Hoang Long', 'Tran Quoc Trung', 'Le Hong Phuc', 'Pham Gia Khiem', 'Do Ngoc Hung'],
  female: ['Tran Thi Hue', 'Pham Thuy Trang', 'Ngo Thanh Lam', 'Dang Thi Mai', 'Vo Thi Thuy',
    'Nguyen Thi Huong', 'Tran Thi Ngoc', 'Le Thi Ha', 'Pham Thi Lan', 'Hoang Thi Ha',
    'Bui Thi Hong', 'Do Thi Hong', 'Vu Thi Huong', 'Nguyen Thi Thuy', 'Tran Thi Minh',
    'Le Thi Ngoc', 'Pham Thi Hang', 'Hoang Thi Mai', 'Nguyen Thi Lan', 'Tran Thi Hanh']
};

const locations = ['Ha Noi', 'TP. Ho Chi Minh', 'Da Nang', 'Hai Phong', 'Can Tho', 'Hue', 'Nha Trang', 'Da Lat', 'Vung Tau', 'Ha Long'];

const occupations = ['Ky su phan mem', 'Designer', 'Marketing', 'Giao vien', 'Bac si', 'Ke toan',
  'Kien truc su', 'Chef', 'Manager', 'Nhan vien kinh doanh', 'Ky su xay dung', 'Nha bao',
  'Nhiep anh gia', 'Luat su', 'Kinh doanh', 'Y ta', 'Ky su dien', 'Nha thiet ke noi that',
  'Chuyen viên IT', 'Content Creator', 'Sinh vien', 'Freelancer', 'Giam doc', 'Truong phong'];

const educations = ['Dai hoc Bach Khoa', 'Dai hoc Kinh te Quoc dan', 'Dai hoc FPT', 'Dai hoc RMIT',
  'Dai hoc Ngoai thuong', 'Dai hoc Luat', 'Dai hoc Y Ha Noi', 'Dai hoc Kien truc',
  'Dai hoc Khoa hoc Tu nhien', 'Dai hoc Cong nghiep', 'Dai hoc Thuong mai', 'Hoc viện Tai chinh'];

const interestsList = ['Du lich', 'Nhiep anh', 'Am thuc', 'Am nhac', 'Doc sach', 'Phim anh',
  'Yoga', 'Thien', 'Game', 'Bong da', 'Cau long', 'Boi lo', 'Chay bo', 'Leo nu',
  'Nau an', 'Ve tranh', 'Thiet ke', 'K-pop', 'Manga', 'Shopping', 'Ca phe', 'Ruou vang',
  'Thien van hoc', 'Cam trai', 'Lap', 'Guitar', 'Piano', 'Khicu vu', 'The duc', 'Gym'];

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
  'Manager trong cong ty IT, thich the thao va adventure. Tim nguoi nang dong.',
  'Designer, sang tao va hien dai. Thich du lich va kham pha van hoa moi.',
  'Chef, dam me am thuc va muon chia se voi nguoi thuong.',
  'Thich nau an, yeu gia dinh. Tim nguoi cung xay dung to am.',
  'Yeu am nhac, thich hat va choi guitar. muon tim nguoi cung dam me.',
  'Kinh doanh online, thich gap go nguoi moi. Tim nguoi that long.',
  'Yeu dong vat, co 2 chu meo. Thich nguoi yeu dong vat.',
  'Freelancer, thich tu do va kham pha. Tim nguoi cung di du lich.',
  'Gym enthusiast, cham soc suc khoe. Tim nguoi co loi song lanh manh.',
  'Thich doc sach va viet blog. Yeu nhung cuoc tro chuyen sau sac.',
  'Nhiep anh gia chuyen nghiep, thich bat khoanh khac. Tim nguoi dac biet.',
  'Giao Vien, yeu tre em va giao duc. Thich nguoi co tam long nhan ai.',
  'Luat su, cong bang va chinh tri. Tim nguoi cung gia tri.',
  'Ky su xay dung, thich xay dung nhung thu ben von. Tim nguoi nghiem tuc.',
  'Yeu thien van, thich ngam sao. Tim nguoi lang man.',
  'Thich cafe va nhung cau chuyen. Yeu cuoc song cham rai.',
  'Nau an ngon, dac biet la mon Viet. Tim nguoi thich am thuc.',
  'Yeu dance, thich nhay. Tim nguoi nang dong va vui ve.',
  'Thich hoa va cay canh. Yeu thien nhien va su yen binh.',
  'Gamer, thich choi game cung nguoi yeu. Tim nguoi cung so thich.',
  'Yeu mua thu va nhung bai hat buon. Nguoi lang man.',
  'Thich yoga va thien dia. Tim nguoi co tam hon dong dien.',
  'Dam me nhiep anh duong pho. Bat khoanh khac cuoc song.',
  'Yeu bien va nhung chuyen di. Tim nguoi cung kham pha the gioi.',
  'Thich lam banh va dessert. Ngot ngao nhu nhung chiec banh.',
  'Kinh doanh bat dong san, thich gap go. Nguoi noi nang li su.',
  'Yeu am nhac co dien va piano. Tim nguoi co gu.',
  'Thich viet lai va blog. Chia se cuoc song qua nhung dong chu.',
  'Nau an chay, yeu suc khoe. Tim nguoi co loi song lanh manh.',
  'Thich mua dong va cafe nong. Nguoi am ap.',
  'Yeu dong vat hoang da, thich safari. Tim nguoi dung cam.',
  'Thich nhay du va mao hiem. Tim nguoi dung cam.',
  'Yeu nghe thuat va trien lam. Nguoi co tam hon nghe si.',
  'Thich cam trai va song gan thien nhien. Tim nguoi phiêu lưu.',
  'Ky su AI, thich cong nghe tuong lai. Tim nguoi coi mo.',
  'Yeu phim co dien va vintage. Nguoi co gu tham my rieng.',
  'Thich lam do handmade. Tim nguoi kien nhan va sang tao.',
  'Yeu hoa anh dao va Nhat Ban. Uoc mo den Tokyo.',
  'Thich boxing va vo thuat. Tim nguoi manh me.',
  'Yeu cay canh va zen. Nguoi binh yen.',
  'Thich dap xe va kham pha. Tim nguoi thich outdoors.',
  'Yeu ruou vang va am thuc Phap. Nguoi tinh te.',
  'Thich K-pop va dance. Tim nguoi tre trung.',
  'Yeu meo va co 3 chu meo. Nguoi nhe nhang.',
  'Thich golf va networking. Nguoi lich thiep.',
  'Yeu thien va mindfulness. Tim nguoi co chieu sau.',
  'Thich danh co va board game. Nguoi thong minh.',
  'Yeu thoi trang va style. Tim nguoi co gu.',
  'Thich podcast va hoc hoi. Nguoi co kien thuc.',
  'Yeu va ton tho me. Nguoi hieu thao.'
];

const avatarUrls = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/men/10.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/men/12.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/men/14.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
  'https://randomuser.me/api/portraits/men/16.jpg',
  'https://randomuser.me/api/portraits/men/17.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
  'https://randomuser.me/api/portraits/men/19.jpg',
  'https://randomuser.me/api/portraits/men/20.jpg',
  'https://randomuser.me/api/portraits/men/21.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/men/23.jpg',
  'https://randomuser.me/api/portraits/men/24.jpg',
  'https://randomuser.me/api/portraits/men/25.jpg',
  'https://randomuser.me/api/portraits/men/26.jpg',
  'https://randomuser.me/api/portraits/men/27.jpg',
  'https://randomuser.me/api/portraits/men/28.jpg',
  'https://randomuser.me/api/portraits/men/29.jpg',
  'https://randomuser.me/api/portraits/men/30.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/women/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/women/9.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
  'https://randomuser.me/api/portraits/women/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/13.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/women/15.jpg',
  'https://randomuser.me/api/portraits/women/16.jpg',
  'https://randomuser.me/api/portraits/women/17.jpg',
  'https://randomuser.me/api/portraits/women/18.jpg',
  'https://randomuser.me/api/portraits/women/19.jpg',
  'https://randomuser.me/api/portraits/women/20.jpg',
  'https://randomuser.me/api/portraits/women/21.jpg',
  'https://randomuser.me/api/portraits/women/22.jpg',
  'https://randomuser.me/api/portraits/women/23.jpg',
  'https://randomuser.me/api/portraits/women/24.jpg',
  'https://randomuser.me/api/portraits/women/25.jpg',
  'https://randomuser.me/api/portraits/women/26.jpg',
  'https://randomuser.me/api/portraits/women/27.jpg',
  'https://randomuser.me/api/portraits/women/28.jpg',
  'https://randomuser.me/api/portraits/women/29.jpg',
  'https://randomuser.me/api/portraits/women/30.jpg'
];

const photoUrls = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/600?random=2',
  'https://picsum.photos/400/600?random=3',
  'https://picsum.photos/400/600?random=4',
  'https://picsum.photos/400/600?random=5',
  'https://picsum.photos/400/600?random=6',
  'https://picsum.photos/400/600?random=7',
  'https://picsum.photos/400/600?random=8',
  'https://picsum.photos/400/600?random=9',
  'https://picsum.photos/400/600?random=10'
];

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUserData() {
  const users = [];
  const usedNames = new Set();
  const usedEmails = new Set();

  for (let i = 0; i < 55; i++) {
    const gender = i % 3 === 0 ? 'female' : 'male';
    let name;
    do {
      name = getRandomItem(vietnameseNames[gender]);
    } while (usedNames.has(name));
    usedNames.add(name);

    let email;
    let emailBase = name.toLowerCase().replace(/[^a-z]/g, '.') + i;
    do {
      email = `${emailBase}@email.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const userInterests = getRandomItems(interestsList, Math.floor(Math.random() * 4) + 3);
    const userPhotos = getRandomItems(photoUrls, Math.floor(Math.random() * 3) + 2);

    const lookingForOptions = ['relationship', 'friendship', 'casual'];
    const lookingFor = lookingForOptions[Math.floor(Math.random() * lookingForOptions.length)];

    const drinkingOptions = ['never', 'sometimes', 'often', ''];
    const drinking = drinkingOptions[Math.floor(Math.random() * drinkingOptions.length)];

    const smokingOptions = ['never', 'sometimes', 'often', ''];
    const smoking = smokingOptions[Math.floor(Math.random() * smokingOptions.length)];

    users.push({
      username: emailBase.replace(/\./g, ''),
      email: email,
      password: 'password123',
      fullName: name,
      age: Math.floor(Math.random() * 15) + 20,
      gender: gender,
      bio: getRandomItem(bios),
      avatar: avatarUrls[i % avatarUrls.length],
      photos: userPhotos,
      interests: userInterests,
      location: getRandomItem(locations),
      occupation: getRandomItem(occupations),
      education: getRandomItem(educations),
      height: gender === 'male'
        ? Math.floor(Math.random() * 15) + 165
        : Math.floor(Math.random() * 15) + 150,
      drinking: drinking,
      smoking: smoking,
      lookingFor: lookingFor,
      preferences: {
        minAge: Math.floor(Math.random() * 5) + 20,
        maxAge: Math.floor(Math.random() * 10) + 30,
        gender: gender === 'male' ? 'female' : 'male'
      },
      isOnline: Math.random() > 0.5,
      lastSeen: Math.random() > 0.5 ? new Date() : new Date(Date.now() - Math.random() * 86400000 * 7),
      isFake: i >= 50 && i < 55,
      fakeScore: i >= 50 && i < 55 ? Math.floor(Math.random() * 20) + 70 : 0
    });
  }

  return users;
}

const userData = generateUserData();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Match.deleteMany({});
    await Message.deleteMany({});
    console.log('Old data cleared');

    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);

    const usersWithHashedPassword = await Promise.all(
      userData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    const users = await User.insertMany(usersWithHashedPassword);
    console.log(`Created ${users.length} users`);

    console.log('Creating matches...');
    const matchesData = [
      { users: [users[0]._id, users[1]._id], lastActivity: new Date(Date.now() - 300000) },
      { users: [users[2]._id, users[3]._id], lastActivity: new Date(Date.now() - 600000) },
      { users: [users[4]._id, users[5]._id], lastActivity: new Date(Date.now() - 1800000) },
      { users: [users[6]._id, users[8]._id], lastActivity: new Date(Date.now() - 3600000) },
      { users: [users[7]._id, users[10]._id], lastActivity: new Date(Date.now() - 7200000) },
      { users: [users[9]._id, users[11]._id], lastActivity: new Date(Date.now() - 10800000) }
    ];

    const matches = await Match.insertMany(matchesData);
    console.log(`Created ${matches.length} matches`);

    console.log('Creating messages...');
    const messagesData = [];

    const conversation1 = [
      { sender: users[0]._id, content: 'Hello! I think your profile is interesting.' },
      { sender: users[1]._id, content: 'Hi! Thanks for the like. Do you like traveling?' },
      { sender: users[0]._id, content: 'I love it! Have you been to any beautiful places?' },
      { sender: users[1]._id, content: 'I have been to Da Nang, Hoi An and Sapa. How about you?' },
      { sender: users[0]._id, content: 'I just went to Nha Trang last week. The beach was beautiful!' }
    ];

    const conversation2 = [
      { sender: users[2]._id, content: 'Hi! I see you also like gaming, what games do you play?' },
      { sender: users[3]._id, content: 'Hi! I play Lien Quan and Valorant mostly.' },
      { sender: users[2]._id, content: 'Cool! I also play Lien Quan. What rank are you?' },
      { sender: users[3]._id, content: 'I am Diamond rank. How about you?' },
      { sender: users[2]._id, content: 'I am Diamond too. Let us play together!' }
    ];

    const conversation3 = [
      { sender: users[5]._id, content: 'Hello! I see you also like drawing.' },
      { sender: users[4]._id, content: 'Hi Lam! Yes, what kind of drawings do you do?' },
      { sender: users[5]._id, content: 'I do landscape and portrait paintings. How about you?' },
      { sender: users[4]._id, content: 'I mainly do abstract paintings. Do you often go to exhibitions?' },
      { sender: users[5]._id, content: 'Yes! There is an exhibition in HCMC next week, do you want to go?' },
      { sender: users[4]._id, content: 'Sure! See you there!' }
    ];

    const conversations = [
      { matchId: matches[0]._id, messages: conversation1 },
      { matchId: matches[1]._id, messages: conversation2 },
      { matchId: matches[2]._id, messages: conversation3 }
    ];

    conversations.forEach(conv => {
      conv.messages.forEach((msg, index) => {
        const createdAt = new Date(Date.now() - (conv.messages.length - index) * 300000);
        messagesData.push({
          matchId: conv.matchId,
          sender: msg.sender,
          content: msg.content,
          messageType: 'text',
          isRead: index < conv.messages.length - 2,
          createdAt,
          updatedAt: createdAt
        });
      });
    });

    await Message.insertMany(messagesData);
    console.log(`Created ${messagesData.length} messages`);

    console.log('\n=== Seed Database Complete ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Total matches: ${matches.length}`);
    console.log(`Total messages: ${messagesData.length}`);

    console.log('\n=== Test Accounts ===');
    users.slice(0, 10).forEach((user, index) => {
      console.log(`Email: ${user.email} | Password: password123`);
    });

    console.log('\n=== Profile Completion Sample ===');
    users.slice(0, 5).forEach(user => {
      console.log(`${user.fullName}: ${user.profileCompletion}% complete`);
    });

    console.log('\n=== MongoDB URI ===');
    console.log(config.mongodbUri);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedDatabase();
