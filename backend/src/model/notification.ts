import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["learning", "system", "achievement", "account"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: "",
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
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type Notification = InferSchemaType<typeof notificationSchema>;

export const notification =
  (mongoose.models.notification as Model<Notification>) ||
  mongoose.model<Notification>("notification", notificationSchema);
