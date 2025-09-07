
import Review from "../models/review.js";
import { isAdmin } from "./userControllers.js";

/** GET /reviews?productId=xxx  (public) */
export async function listReviews(req, res) {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const docs = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
    return res.json(docs);
  } catch (err) {
    console.error("listReviews error:", err);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
}

/** GET /reviews/all  (admin only) */
export async function getAllReviews(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Access denied. Admin Only." });
    }
    const docs = await Review.find().sort({ createdAt: -1 }).lean();
    return res.json(docs);
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({ message: "Failed to fetch all reviews" });
  }
}

/** POST /reviews  (auth required)  body: { productId, rating, comment } */
export async function createOrUpdateReview(req, res) {
  try {
    const { productId, rating, comment } = req.body;

    // honor req.user.userId (set by your global middleware)
    const userIdRaw = req.user?.userId || req.user?.id || req.user?._id;
    if (!userIdRaw) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: "rating must be 1-5" });
    }

    const cleanComment = String(comment || "").trim();
    if (!cleanComment) {
      return res.status(400).json({ message: "comment is required" });
    }
    if (cleanComment.length > 1000) {
      return res.status(400).json({ message: "comment is too long (max 1000 chars)" });
    }

    const userId = String(userIdRaw);
    const userName =
      req.user?.name ||
      (req.user?.firstName || req.user?.lastName
        ? `${req.user?.firstName || ""} ${req.user?.lastName || ""}`.trim()
        : (req.user?.email || "").split("@")[0]) ||
      "User";

    // same user can edit their review for this product
    const doc = await Review.findOneAndUpdate(
      { productId: String(productId), userId },
      { $set: { rating: r, comment: cleanComment, userName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(doc);
  } catch (err) {
    console.error("createOrUpdateReview error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: "You have already submitted a review for this product" });
    }
    return res.status(500).json({ message: "Failed to submit review" });
  }
}

/** DELETE /reviews/:id  (owner or admin) */
export async function deleteReview(req, res) {
  try {
    const id = req.params.id;
    const doc = await Review.findById(id);
    if (!doc) return res.status(404).json({ message: "Review not found" });

    //  honor req.user.userId
    const userIdRaw = req.user?.userId || req.user?.id || req.user?._id || "";
    const userId = String(userIdRaw || "");
    const isOwner = userId && userId === doc.userId;

    if (!isOwner && !isAdmin(req)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Review.deleteOne({ _id: id });
    return res.json({ message: "Review deleted", review: doc });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ message: "Failed to delete review" });
  }
}
