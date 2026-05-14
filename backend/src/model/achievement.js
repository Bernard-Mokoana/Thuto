import mongoose, { Schema } from "mongoose";

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
      enum: [
        "course_completion",
        "perfect_score",
        "streak",
        "first_course",
        "reviewer",
        "early_bird",
      ],
      required: true,
    },
    criteria: {
      type: Schema.Types.Mixed,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
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
  {
    timestamps: true,
  }
);

export const achievement = mongoose.model("achievement", achievementSchema);
