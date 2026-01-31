import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password must be 6 characters long"],
    },
    role: {
      type: String,
      enum: ["Student", "Admin", "Tutor"],
      default: "Student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordEXpire: Date,
  },
  {
    timestamps: true,
  }
);

export const user = mongoose.model("user", userSchema);
