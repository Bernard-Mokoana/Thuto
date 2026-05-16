import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ticketMessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
      },
    ],
  },
  { timestamps: true }
);

const supportTicketSchema = new Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["technical", "learning_content", "account", "general"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_for_user", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    relatedPath: {
      type: Schema.Types.ObjectId,
      ref: "learningPath",
    },
    relatedLesson: {
      type: Schema.Types.ObjectId,
      ref: "learningLesson",
    },
    relatedTask: {
      type: Schema.Types.ObjectId,
      ref: "task",
    },
    messages: [ticketMessageSchema],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    resolution: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    satisfactionComment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ priority: 1, status: 1 });

export type SupportTicket = InferSchemaType<typeof supportTicketSchema>;

export const supportTicket =
  (mongoose.models.supportTicket as Model<SupportTicket>) ||
  mongoose.model<SupportTicket>("supportTicket", supportTicketSchema);
