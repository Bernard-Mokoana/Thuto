import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const certificateSchema = new Schema(
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
    issueAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    certificateUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1, path: 1 }, { unique: true });

export type Certificate = InferSchemaType<typeof certificateSchema>;

export const certificate =
  (mongoose.models.certificate as Model<Certificate>) ||
  mongoose.model<Certificate>("certificate", certificateSchema);
