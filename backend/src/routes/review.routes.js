// backend/src/routes/review.routes.js

import { Router } from "express";
import {
  createOrUpdateReview,
  getProductReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// Public — anyone can see reviews
router.get("/:productId", getProductReviews);

// Protected — must be logged in
router.post("/", isAuthenticated, createOrUpdateReview);
router.delete("/:productId", isAuthenticated, deleteReview);

export default router;