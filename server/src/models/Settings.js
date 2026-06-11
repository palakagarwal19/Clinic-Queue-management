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
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
