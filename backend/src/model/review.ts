import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const reviewSchema = new Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ student: 1, path: 1 }, { unique: true });
reviewSchema.index({ path: 1, rating: -1 });

export type Review = InferSchemaType<typeof reviewSchema>;

export const review =
  (mongoose.models.review as Model<Review>) ||
  mongoose.model<Review>("review", reviewSchema);
