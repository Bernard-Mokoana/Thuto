import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["eft", "card", "cash", "wallet"],
      default: "wallet",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reference: String,
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
