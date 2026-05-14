import mongoose, { Schema } from "mongoose";

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
    relatedCourse: {
      type: Schema.Types.ObjectId,
      ref: "course",
    },
    relatedAssessment: {
      type: Schema.Types.ObjectId,
      ref: "assessment",
    },
    metadata: {
      type: Schema.Types.Mixed, // Additional data about how achievement was earned
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique user-achievement combinations
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export const userAchievement = mongoose.model(
  "userAchievement",
  userAchievementSchema
);
