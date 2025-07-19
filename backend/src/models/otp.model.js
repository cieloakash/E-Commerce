import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000),
    index: { expires: "5m" },
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 
  }
});
otpSchema.index({ email: 1, otp: 1 });

export const Otp = mongoose.model("Otp", otpSchema);
