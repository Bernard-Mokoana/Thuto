import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userGamificationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityDate: {
      type: Date,
    },
    hearts: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    heartsRefilledAt: {
      type: Date,
    },
    dailyGoalXp: {
      type: Number,
      default: 30,
      min: 0,
    },
  },
  { timestamps: true }
);

userGamificationSchema.index({ totalXp: -1 });
userGamificationSchema.index({ currentStreak: -1 });

export type UserGamification = InferSchemaType<typeof userGamificationSchema>;

export const userGamification =
  (mongoose.models.userGamification as Model<UserGamification>) ||
  mongoose.model<UserGamification>(
    "userGamification",
    userGamificationSchema
  );
