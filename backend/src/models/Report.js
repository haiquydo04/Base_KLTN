/**
 * Report Model - Báo cáo người dùng vi phạm
 */

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'fake_profile',
      'inappropriate_content',
      'harassment',
      'spam',
      'scam',
      'underage',
      'other'
    ]
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  evidence: [{
    type: String  // URLs to screenshots or other evidence
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ targetId: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate reports from same user for same target
reportSchema.index({ reporterId: 1, targetId: 1 }, { unique: true });

// Static method to get report reason label
reportSchema.statics.getReasonLabel = function(reason) {
  const labels = {
    'fake_profile': 'Fake Profile',
    'inappropriate_content': 'Inappropriate Content',
    'harassment': 'Harassment',
    'spam': 'Spam',
    'scam': 'Scam',
    'underage': 'Underage User',
    'other': 'Other'
  };
  return labels[reason] || reason;
};

// Static method to get stats
reportSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  return stats;
};

const Report = mongoose.model('Report', reportSchema);

export default Report;