import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const analyticsSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    metrics: {
      totalUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      totalPaths: { type: Number, default: 0 },
      totalEnrollments: { type: Number, default: 0 },
      newEnrollments: { type: Number, default: 0 },
      pathCompletions: { type: Number, default: 0 },
      lessonCompletions: { type: Number, default: 0 },
      totalTaskAttempts: { type: Number, default: 0 },
      averageTaskAccuracy: { type: Number, default: 0 },
      totalXpEarned: { type: Number, default: 0 },
      averageSessionDuration: { type: Number, default: 0 },
    },
    categoryBreakdown: [
      {
        category: { type: Schema.Types.ObjectId, ref: "category" },
        enrollments: Number,
        completions: Number,
      },
    ],
    topPaths: [
      {
        path: { type: Schema.Types.ObjectId, ref: "learningPath" },
        enrollments: Number,
        completions: Number,
        averageScore: Number,
      },
    ],
    retention: {
      day1: Number,
      day7: Number,
      day30: Number,
    },
  },
  { timestamps: true }
);

analyticsSchema.index({ date: 1, type: 1 }, { unique: true });
analyticsSchema.index({ type: 1, date: -1 });

export type Analytics = InferSchemaType<typeof analyticsSchema>;

export const analytics =
  (mongoose.models.analytics as Model<Analytics>) ||
  mongoose.model<Analytics>("analytics", analyticsSchema);
