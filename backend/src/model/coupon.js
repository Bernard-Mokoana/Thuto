import mongoose, { Schema } from "mongoose";

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
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumAmount: {
      type: Number,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
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
    applicableCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "course",
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
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

export const coupon = mongoose.model("coupon", couponSchema);
