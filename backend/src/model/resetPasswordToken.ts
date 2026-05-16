import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const resetPasswordTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
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

resetPasswordTokenSchema.index({ user: 1, revokedAt: 1 });
resetPasswordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type ResetPasswordToken = InferSchemaType<typeof resetPasswordTokenSchema>;

const ResetPasswordTokenModel =
  (mongoose.models.resetPasswordToken as Model<ResetPasswordToken>) ||
  mongoose.model<ResetPasswordToken>(
    "resetPasswordToken",
    resetPasswordTokenSchema
  );

export default ResetPasswordTokenModel;
