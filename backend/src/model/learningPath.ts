import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const learningPathSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    outcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

learningPathSchema.index({ category: 1, isPublished: 1 });
learningPathSchema.index({ level: 1, isPublished: 1 });
learningPathSchema.index({ title: "text", description: "text", tags: "text" });

export type LearningPath = InferSchemaType<typeof learningPathSchema>;

export const learningPath =
  (mongoose.models.learningPath as Model<LearningPath>) ||
  mongoose.model<LearningPath>("learningPath", learningPathSchema);
