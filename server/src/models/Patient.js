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
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'completed', 'cancelled'],
      default: 'waiting',
    },
    servedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

patientSchema.index({ status: 1, createdAt: 1 });

export default mongoose.model('Patient', patientSchema);
