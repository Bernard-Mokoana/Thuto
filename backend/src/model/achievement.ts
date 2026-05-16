import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const achievementTypes = [
  "path_completion",
  "lesson_completion",
  "perfect_task",
  "xp_total",
  "streak",
  "first_path",
  "daily_goal",
] as const;

const achievementSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: achievementTypes,
      required: true,
    },
    criteria: {
      type: Schema.Types.Mixed,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
    },
  },
  { timestamps: true }
);

achievementSchema.index({ type: 1, isActive: 1 });

export type Achievement = InferSchemaType<typeof achievementSchema>;

export const achievement =
  (mongoose.models.achievement as Model<Achievement>) ||
  mongoose.model<Achievement>("achievement", achievementSchema);
