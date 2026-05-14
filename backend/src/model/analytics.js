import mongoose, { Schema } from "mongoose";

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
      totalCourses: { type: Number, default: 0 },
      totalEnrollments: { type: Number, default: 0 },
      newEnrollments: { type: Number, default: 0 },
      courseCompletions: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      averageSessionDuration: { type: Number, default: 0 },
      totalAssessmentsTaken: { type: Number, default: 0 },
      averageAssessmentScore: { type: Number, default: 0 },
    },
    categoryBreakdown: [
      {
        category: { type: Schema.Types.ObjectId, ref: "category" },
        enrollments: Number,
        revenue: Number,
        completions: Number,
      },
    ],
    topCourses: [
      {
        course: { type: Schema.Types.ObjectId, ref: "course" },
        enrollments: Number,
        revenue: Number,
        rating: Number,
      },
    ],
    retention: {
      day1: Number,
      day7: Number,
      day30: Number,
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ date: 1, type: 1 }, { unique: true });
analyticsSchema.index({ type: 1, date: -1 });

export const analytics = mongoose.model("analytics", analyticsSchema);
