import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userProgressSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    path: {
      type: Schema.Types.ObjectId,
      ref: "learningPath",
      required: true,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: "learningModule",
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "learningLesson",
      required: true,
    },
    step: {
      type: Schema.Types.ObjectId,
      ref: "lessonStep",
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
userProgressSchema.index({ student: 1, path: 1, status: 1 });
userProgressSchema.index({ student: 1, lastAccessedAt: -1 });

export type UserProgress = InferSchemaType<typeof userProgressSchema>;

export const userProgress =
  (mongoose.models.userProgress as Model<UserProgress>) ||
  mongoose.model<UserProgress>("userProgress", userProgressSchema);
