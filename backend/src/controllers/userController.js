import User from '../models/User.js';
import Match from '../models/Match.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    
    const query = {
      _id: { $ne: req.user._id },
      age: { 
        $gte: currentUser.preferences.minAge || 18, 
        $lte: currentUser.preferences.maxAge || 100 
      }
    };

    if (currentUser.preferences.gender && currentUser.preferences.gender !== 'both') {
      query.gender = currentUser.preferences.gender;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['fullName', 'age', 'gender', 'bio', 'interests', 'location', 'preferences'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getUserMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      users: req.user._id,
      isActive: true
    })
    .populate('users', '-password')
    .sort({ lastActivity: -1 });

    const matchesWithOtherUser = matches.map(match => {
      const otherUser = match.users.find(
        user => user._id.toString() !== req.user._id.toString()
      );
      return {
        _id: match._id,
        user: otherUser,
        lastActivity: match.lastActivity,
        createdAt: match.createdAt
      };
    });

    res.json({
      success: true,
      matches: matchesWithOtherUser
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    const likedByMe = await Match.find({
      users: req.user._id
    }).populate('users', '_id');

    const likedUserIds = likedByMe.flatMap(m => 
      m.users
        .filter(u => u._id.toString() !== req.user._id.toString())
        .map(u => u._id)
    );

    const query = {
      _id: { 
        $nin: [req.user._id, ...likedUserIds] 
      },
      age: { 
        $gte: currentUser.preferences.minAge || 18, 
        $lte: currentUser.preferences.maxAge || 100 
      }
    };

    if (currentUser.preferences.gender && currentUser.preferences.gender !== 'both') {
      query.gender = currentUser.preferences.gender;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ fakeScore: 1, createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này chứa các controller xử lý các chức năng liên quan đến user:
lấy danh sách users, xem profile user, cập nhật profile,
lấy danh sách matches của user, và gợi ý users.

Các function chính:
- getUsers(): Lấy danh sách users có phân trang, lọc theo preferences của current user
- getUserById(): Lấy thông tin user cụ thể theo ID
- updateProfile(): Cập nhật thông tin profile (fullName, age, gender, bio, interests, location, preferences)
- getUserMatches(): Lấy danh sách các match của user hiện tại
- getRecommendedUsers(): Lấy danh sách users được gợi ý (đã loại trừ user đã like và chính mình, ưu tiên fakeScore thấp)

Luồng hoạt động:
Client → GET/POST /api/users → Controller xử lý → Model (User, Match)
→ MongoDB → Response

Ghi chú:
File này được sử dụng bởi userRoutes.js.
Middleware auth được dùng để lấy req.user._id.
getRecommendedUsers sử dụng fakeScore để ưu tiên hiển thị user thật trước fake account.
*/
