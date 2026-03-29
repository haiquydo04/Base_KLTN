import mongoose from 'mongoose';

const videoSessionSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sessionType: {
    type: String,
    enum: ['random', 'match'],
    default: 'random'
  },
  status: {
    type: String,
    enum: ['waiting', 'connected', 'ended'],
    default: 'waiting'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

videoSessionSchema.index({ participants: 1 });
videoSessionSchema.index({ status: 1 });

export default mongoose.model('VideoSession', videoSessionSchema);
