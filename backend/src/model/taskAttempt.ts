import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const taskAttemptSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "task",
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "learningLesson",
      required: true,
    },
    submittedAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

taskAttemptSchema.index({ student: 1, task: 1, attemptedAt: -1 });
taskAttemptSchema.index({ student: 1, lesson: 1 });

export type TaskAttempt = InferSchemaType<typeof taskAttemptSchema>;

export const taskAttempt =
  (mongoose.models.taskAttempt as Model<TaskAttempt>) ||
  mongoose.model<TaskAttempt>("taskAttempt", taskAttemptSchema);
