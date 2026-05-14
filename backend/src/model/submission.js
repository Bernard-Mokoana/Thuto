import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    assessment: {
      type: Schema.Types.ObjectId,
      ref: "assessment",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    course: { type: Schema.Types.ObjectId, ref: "course", required: true },
    lesson: { type: Schema.Types.ObjectId, ref: "lessons", required: true },
    answers: {
      type: [String],
    },
    grade: {
      type: Number,
      default: 0,
    },
    // gradeBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "user",
    // },
    submittedAt: {
      type: Date,
      default: Date.now(),
    },
    isCompleted: Boolean,
  },
  { timestamps: true }
);

submissionSchema.index({ assessment: 1, student: 1 }, { unique: true });

export const submission = mongoose.model("submission", submissionSchema);
