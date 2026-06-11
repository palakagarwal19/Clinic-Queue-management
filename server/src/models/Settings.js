import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    consultationTimeMinutes: {
      type: Number,
      default: 10,
      min: 1,
      max: 120,
    },
    lastTokenNumber: {
      type: Number,
      default: 100,
      min: 0,
    },
    queueLocked: {
      type: Boolean,
      default: false,
    },
    lockedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
