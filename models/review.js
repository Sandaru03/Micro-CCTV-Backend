import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId:   { type: String, required: true, index: true },
    userName: { type: String, default: "User" },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("reviews", reviewSchema);
export default Review;
