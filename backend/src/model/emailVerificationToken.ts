import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const emailVerificationTokenSchema = new Schema({
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

emailVerificationTokenSchema.index({ user: 1, revokedAt: 1 });
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type EmailVerificationToken = InferSchemaType<
  typeof emailVerificationTokenSchema
>;

const EmailVerificationTokenModel =
  (mongoose.models.emailVerificationToken as Model<EmailVerificationToken>) ||
  mongoose.model<EmailVerificationToken>(
    "emailVerificationToken",
    emailVerificationTokenSchema
  );

export default EmailVerificationTokenModel;
