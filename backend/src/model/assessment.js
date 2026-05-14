import mongoose, { mongo, Schema } from "mongoose";

const assessmentSchema = new Schema(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "lesson",
      required: true,
    },
    questions: {
      question: String,
      Options: [String],
      correctAnswer: String,
    },
    type: {
      type: String,
      enum: ["quiz", "assessment", "exam"],
      default: "quiz",
    },
  },
  { timestamps: true }
);

export const assessment = mongoose.model("assessment", assessmentSchema);
