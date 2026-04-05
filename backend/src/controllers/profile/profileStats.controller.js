/**
 * Profile Stats Controller - Lấy thông tin hoàn thiện hồ sơ
 * Endpoint: GET /profile/stats
 */

import User from '../../models/User.js';
import UserTag from '../../models/UserTag.js';

/**
 * GET /api/profile/stats
 * Lấy phần trăm hoàn thiện và chi tiết các trường còn thiếu của user
 */
export const getProfileStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log('[ProfileStats] Getting stats for user:', userId);

    // Lấy user data
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Lấy interests từ UserTag (nếu có)
    const userTags = await UserTag.find({ userId }).populate('tagId').lean();
    const tagInterests = userTags
      .filter(ut => ut.tagId)
      .map(ut => ut.tagId.name);

    // Tính completion chi tiết
    const fields = {
      avatar: {
        label: 'Profile photo',
        icon: '📷',
        points: 20,
        completed: !!(user.avatar && user.avatar.trim() !== '')
      },
      bio: {
        label: 'Bio',
        icon: '✍️',
        points: 10,
        completed: !!(user.bio && user.bio.trim() !== '')
      },
      age: {
        label: 'Age',
        icon: '🎂',
        points: 10,
        completed: !!user.age
      },
      location: {
        label: 'Location',
        icon: '📍',
        points: 10,
        completed: !!(
          user.location?.coordinates &&
          Array.isArray(user.location.coordinates) &&
          user.location.coordinates.length === 2 &&
          !(user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0)
        )
      },
      interests: {
        label: 'Interests',
        icon: '❤️',
        points: 10,
        completed: !!(user.interests?.length > 0 || tagInterests.length > 0)
      },
      photos: {
        label: 'Photos (2+)',
        icon: '🖼️',
        points: 20,
        completed: !!(user.photos && user.photos.length >= 2)
      },
      occupation: {
        label: 'Occupation',
        icon: '💼',
        points: 5,
        completed: !!(user.occupation && user.occupation.trim() !== '')
      },
      education: {
        label: 'Education',
        icon: '🎓',
        points: 5,
        completed: !!(user.education && user.education.trim() !== '')
      },
      genderPref: {
        label: 'Gender & Preferences',
        icon: '⚙️',
        points: 10,
        completed: !!(user.gender && user.lookingFor)
      }
    };

    // Tính tổng điểm
    const totalPoints = Object.values(fields).reduce((sum, f) => sum + f.points, 0);
    const completedPoints = Object.values(fields)
      .filter(f => f.completed)
      .reduce((sum, f) => sum + f.points, 0);
    const percentage = Math.round((completedPoints / totalPoints) * 100);

    // Lấy các trường còn thiếu
    const missingFields = Object.entries(fields)
      .filter(([_, f]) => !f.completed)
      .map(([key, f]) => ({
        key,
        ...f
      }));

    console.log('[ProfileStats] Stats calculated:', {
      percentage,
      missingCount: missingFields.length
    });

    return res.json({
      success: true,
      data: {
        completion: percentage,
        totalPoints,
        completedPoints,
        fields,
        missingFields,
        interestsCount: user.interests?.length || tagInterests.length || 0,
        photosCount: user.photos?.length || 0,
        hasAvatar: !!(user.avatar && user.avatar.trim() !== ''),
        hasBio: !!(user.bio && user.bio.trim() !== ''),
        hasLocation: fields.location.completed,
        hasGenderPref: fields.genderPref.completed
      }
    });
  } catch (error) {
    console.error('[ProfileStats] Error:', error);
    next(error);
  }
};

export default { getProfileStats };