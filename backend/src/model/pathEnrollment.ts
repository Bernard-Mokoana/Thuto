import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const pathEnrollmentSchema = new Schema(
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
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    currentLesson: {
      type: Schema.Types.ObjectId,
      ref: "learningLesson",
    },
  },
  { timestamps: true }
);

pathEnrollmentSchema.index({ student: 1, path: 1 }, { unique: true });
pathEnrollmentSchema.index({ student: 1, status: 1 });

export type PathEnrollment = InferSchemaType<typeof pathEnrollmentSchema>;

export const pathEnrollment =
  (mongoose.models.pathEnrollment as Model<PathEnrollment>) ||
  mongoose.model<PathEnrollment>("pathEnrollment", pathEnrollmentSchema);
