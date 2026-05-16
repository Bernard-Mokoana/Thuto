import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rewardType: {
      type: String,
      enum: ["bonus_xp", "hearts_refill", "streak_freeze"],
      required: true,
    },
    rewardValue: {
      type: Number,
      required: true,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicablePaths: [
      {
        type: Schema.Types.ObjectId,
        ref: "learningPath",
      },
    ],
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "category",
      },
    ],
    userRestrictions: {
      newUsersOnly: {
        type: Boolean,
        default: false,
      },
      specificUsers: [
        {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      maxUsagePerUser: {
        type: Number,
        default: 1,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

export type Coupon = InferSchemaType<typeof couponSchema>;

export const coupon =
  (mongoose.models.coupon as Model<Coupon>) ||
  mongoose.model<Coupon>("coupon", couponSchema);
