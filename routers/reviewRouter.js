// routers/reviewRouter.js
import express from "express";
import {
  listReviews,
  getAllReviews,
  createOrUpdateReview,
  deleteReview,
} from "../controllers/reviewControllers.js";

const reviewRouter = express.Router();

/** Guards that rely on req.user set by your global middleware in index.js */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req, res, next) {
  // allow both admin / superadmin if you have such a role
  const role = req.user?.role;
  if (role === "admin" || role === "superadmin") return next();
  return res.status(403).json({ message: "Access denied. Admin Only." });
}

/** Public: list reviews for a product (no login required) */
reviewRouter.get("/", listReviews);

/** Admin: view all reviews */
reviewRouter.get("/all", requireAuth, requireAdmin, getAllReviews);

/** Auth: create or update own review */
reviewRouter.post("/", requireAuth, createOrUpdateReview);

/** Auth: delete (owner or admin) — controller checks owner/admin */
reviewRouter.delete("/:id", requireAuth, deleteReview);

export default reviewRouter;
