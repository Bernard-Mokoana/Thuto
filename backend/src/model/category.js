import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
    courseCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
categorySchema.index({ parentCategory: 1, isActive: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for getting subcategories
categorySchema.virtual("subcategories", {
  ref: "category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Method to update course count
categorySchema.methods.updateCourseCount = async function () {
  const Course = mongoose.model("course");
  const count = await Course.countDocuments({
    category: this._id,
    isPublished: true,
  });
  this.courseCount = count;
  return this.save();
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true })
    .populate("subcategories")
    .sort({ sortOrder: 1, name: 1 });

  return categories.filter((cat) => !cat.parentCategory);
};

// Pre-save middleware to generate slug
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export const category = mongoose.model("category", categorySchema);
