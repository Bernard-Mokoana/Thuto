import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userAchievementSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    achievement: {
      type: Schema.Types.ObjectId,
      ref: "achievement",
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    relatedPath: {
      type: Schema.Types.ObjectId,
      ref: "learningPath",
    },
    relatedLesson: {
      type: Schema.Types.ObjectId,
      ref: "learningLesson",
    },
    relatedTask: {
      type: Schema.Types.ObjectId,
      ref: "task",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ user: 1, earnedAt: -1 });

export type UserAchievement = InferSchemaType<typeof userAchievementSchema>;

export const userAchievement =
  (mongoose.models.userAchievement as Model<UserAchievement>) ||
  mongoose.model<UserAchievement>("userAchievement", userAchievementSchema);
