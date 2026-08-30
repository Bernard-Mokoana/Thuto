import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
    },
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
      lowercase: true,
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
      default: "",
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

export type User = InferSchemaType<typeof userSchema>;

export const user =
  (mongoose.models.user as Model<User>) ||
  mongoose.model<User>("user", userSchema);
