import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const taskTypes = [
  "multiple_choice",
  "fill_blank",
  "code",
  "matching",
  "ordering",
] as const;

const taskSchema = new Schema(
  {
    step: {
      type: Schema.Types.ObjectId,
      ref: "lessonStep",
      required: true,
    },
    type: {
      type: String,
      enum: taskTypes,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
      select: false,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
    xpReward: {
      type: Number,
      default: 10,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    sortOrder: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

taskSchema.index({ step: 1, sortOrder: 1 });
taskSchema.index({ step: 1, type: 1 });

export type Task = InferSchemaType<typeof taskSchema>;

export const task =
  (mongoose.models.task as Model<Task>) ||
  mongoose.model<Task>("task", taskSchema);
