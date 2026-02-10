import mongoose, { Schema } from "mongoose";

const progressSchema = new Schema({
  lesson: {
    type: Schema.Types.ObjectId,
    ref: "lesson",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
});

const enrollmentSchema = new Schema(
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
    progress: [progressSchema],
    enrolledAt: {
      type: Date,
      default: Date.now(),
    },
    certificateUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const enrollment = mongoose.model("enrollment", enrollmentSchema);
