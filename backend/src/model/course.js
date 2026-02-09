import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ tutor: 1, isPublished: 1 });
courseSchema.index({ title: "text", description: "text" });

export const course = mongoose.model("course", courseSchema);
