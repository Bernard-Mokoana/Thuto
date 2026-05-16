import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const refreshTokenSchema = new Schema({
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

refreshTokenSchema.index({ user: 1, revokedAt: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshToken = InferSchemaType<typeof refreshTokenSchema>;

const RefreshTokenModel =
  (mongoose.models.refreshToken as Model<RefreshToken>) ||
  mongoose.model<RefreshToken>("refreshToken", refreshTokenSchema);

export default RefreshTokenModel;
