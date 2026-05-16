import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const lessonStepTypes = [
  "explanation",
  "multiple_choice",
  "fill_blank",
  "code",
  "matching",
  "ordering",
] as const;

const lessonStepSchema = new Schema(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "learningLesson",
      required: true,
    },
    type: {
      type: String,
      enum: lessonStepTypes,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    prompt: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    isCheckpoint: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonStepSchema.index({ lesson: 1, order: 1 }, { unique: true });
lessonStepSchema.index({ lesson: 1, type: 1 });

export type LessonStep = InferSchemaType<typeof lessonStepSchema>;

export const lessonStep =
  (mongoose.models.lessonStep as Model<LessonStep>) ||
  mongoose.model<LessonStep>("lessonStep", lessonStepSchema);
