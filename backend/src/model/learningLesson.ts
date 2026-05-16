import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const learningLessonSchema = new Schema(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "learningModule",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    xpReward: {
      type: Number,
      default: 10,
      min: 0,
    },
    estimatedMinutes: {
      type: Number,
      default: 3,
      min: 1,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

learningLessonSchema.index({ module: 1, order: 1 }, { unique: true });
learningLessonSchema.index({ module: 1, isPublished: 1 });

export type LearningLesson = InferSchemaType<typeof learningLessonSchema>;

export const learningLesson =
  (mongoose.models.learningLesson as Model<LearningLesson>) ||
  mongoose.model<LearningLesson>("learningLesson", learningLessonSchema);
