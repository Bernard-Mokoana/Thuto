import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const learningModuleSchema = new Schema(
  {
    path: {
      type: Schema.Types.ObjectId,
      ref: "learningPath",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    requiredXpToUnlock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

learningModuleSchema.index({ path: 1, order: 1 }, { unique: true });
learningModuleSchema.index({ path: 1, isPublished: 1 });

export type LearningModule = InferSchemaType<typeof learningModuleSchema>;

export const learningModule =
  (mongoose.models.learningModule as Model<LearningModule>) ||
  mongoose.model<LearningModule>("learningModule", learningModuleSchema);
