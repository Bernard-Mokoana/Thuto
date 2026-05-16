import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

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
      default: "",
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
    pathCount: {
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
  { timestamps: true }
);

categorySchema.index({ parentCategory: 1, isActive: 1 });
categorySchema.index({ sortOrder: 1 });

categorySchema.virtual("subcategories", {
  ref: "category",
  localField: "_id",
  foreignField: "parentCategory",
});

categorySchema.methods.updatePathCount = async function () {
  const LearningPath = mongoose.model("learningPath");
  const count = await LearningPath.countDocuments({
    category: this._id,
    isPublished: true,
  });
  this.pathCount = count;
  return this.save();
};

categorySchema.methods.updateCourseCount = categorySchema.methods.updatePathCount;

categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true })
    .populate("subcategories")
    .sort({ sortOrder: 1, name: 1 });

  return categories.filter((cat) => !cat.parentCategory);
};

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export type Category = InferSchemaType<typeof categorySchema>;

export const category =
  (mongoose.models.category as Model<Category>) ||
  mongoose.model<Category>("category", categorySchema);
