import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    default: 0,
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: "lessons",
  },
  activity: {
    type: String,
    enum: ["video_watch", "reading", "quiz", "assessment"],
  },
});

const progressSchema = new Schema(
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
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "lessons",
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    sessions: [sessionSchema],
    notes: [
      {
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bookmarks: [
      {
        timestamp: Number,
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    quizAttempts: [
      {
        assessment: {
          type: Schema.Types.ObjectId,
          ref: "assessment",
        },
        score: Number,
        attempts: Number,
        lastAttempt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ student: 1, lesson: 1 }, { unique: true });
progressSchema.index({ student: 1, course: 1, status: 1 });

export const progress = mongoose.model("progress", progressSchema);
