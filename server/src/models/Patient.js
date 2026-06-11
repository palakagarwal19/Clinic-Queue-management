import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'completed'],
      default: 'waiting',
    },
    servedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
