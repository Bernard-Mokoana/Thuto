import mongoose, { Schema } from "mongoose";

const certificateSchema = new Schema(
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
    issueAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      required: true,
    },
    certificateUrl: String,
  },
  { timestamps: true }
);

export const certificate = mongoose.model("certificate", certificateSchema);
