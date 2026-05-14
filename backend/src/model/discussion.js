import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isAnswer: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
  },
  {
    timestamps: true,
  }
);

const discussionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
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
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: ["question", "discussion", "announcement", "help"],
      default: "question",
    },
    status: {
      type: String,
      enum: ["open", "resolved", "closed"],
      default: "open",
    },
    views: {
      type: Number,
      default: 0,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    comments: [commentSchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

discussionSchema.index({ course: 1, createdAt: -1 });
discussionSchema.index({ author: 1, createdAt: -1 });
discussionSchema.index({ status: 1, category: 1 });

export const discussion = mongoose.model("discussion", discussionSchema);
