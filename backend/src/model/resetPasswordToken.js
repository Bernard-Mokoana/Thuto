import mongoose from "mongoose";

const resetPasswordTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    index: true,
  },
  jwtId: {
    type: String,
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  replacedBy: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ip: String,
  userAgent: String,
});

const ResetPassworToken = mongoose.model(
  "resetPasswordToken",
  resetPasswordTokenSchema
);

export default ResetPassworToken;
