/**
 * Like User Controller - Thin layer, delegates to service
 * FIX: Send Socket.IO notification when match is created
 */
import matchService from '../../services/match.service.js';

export const likeUser = async (req, res, next) => {
  try {
    const result = await matchService.likeUser(req.user._id, req.body.userId);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    // ========== FIX: Send Socket.IO notification for new match ==========
    if (result.matched && result.match) {
      const io = req.app.get('io');
      const targetUserId = req.body.userId;

      if (io) {
        // Get the other user's data
        const otherUser = req.user;

        // Emit to the target user's room
        io.to(`user:${targetUserId}`).emit('new_match', {
          matchId: result.match._id,
          match: result.match,
          matchedBy: {
            _id: otherUser._id,
            username: otherUser.username,
            fullName: otherUser.fullName,
            avatar: otherUser.avatar,
            age: otherUser.age,
            bio: otherUser.bio
          },
          message: `${otherUser.username || 'Ai đó'} đã thích bạn!`
        });

        console.log(`[Socket.IO] 📢 Sent 'new_match' to user ${targetUserId}`);
      }
    }
    // ========== END FIX ==========

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export default { likeUser };
