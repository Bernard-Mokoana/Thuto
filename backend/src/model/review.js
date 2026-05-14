import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "course",
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
      default: false, // Only verified after course completion
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
  {
    timestamps: true,
  }
);

// Ensure one review per student per course
reviewSchema.index({ student: 1, course: 1 }, { unique: true });

export const review = mongoose.model("review", reviewSchema);
