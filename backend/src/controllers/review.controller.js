// backend/src/controllers/review.controller.js

import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ========================
//   ADD / UPDATE REVIEW
// ========================
export const createOrUpdateReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  // 1. Validate
  if (!productId || !rating || !comment) {
    throw new ApiError(400, "Product ID, rating, and comment are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // 2. Find product
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 3. Check if user already reviewed this product
  const existingReviewIndex = product.reviews.findIndex(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (existingReviewIndex > -1) {
    // Update existing review
    product.reviews[existingReviewIndex].rating = rating;
    product.reviews[existingReviewIndex].comment = comment;
  } else {
    // Add new review
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    });
  }

  // 4. Recalculate average rating
  product.numOfReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((sum, review) => sum + review.rating, 0) /
    product.reviews.length;

  // 5. Save
  await product.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      existingReviewIndex > -1
        ? "Review updated successfully"
        : "Review added successfully"
    )
  );
});

// ========================
//   GET ALL REVIEWS
//   (For a specific product)
// ========================
export const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews: product.reviews,
        totalReviews: product.numOfReviews,
        averageRating: product.ratings,
      },
      "Reviews fetched successfully"
    )
  );
});

// ========================
//   DELETE REVIEW
// ========================
export const deleteReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { reviewId } = req.query;

  if (!reviewId) {
    throw new ApiError(400, "Review ID is required");
  }

  // 1. Find product
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 2. Find review
  const reviewIndex = product.reviews.findIndex(
    (review) => review._id.toString() === reviewId
  );

  if (reviewIndex === -1) {
    throw new ApiError(404, "Review not found");
  }

  // 3. Check authorization — only review owner or admin can delete
  const review = product.reviews[reviewIndex];
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  // 4. Remove review
  product.reviews.splice(reviewIndex, 1);

  // 5. Recalculate ratings
  if (product.reviews.length > 0) {
    product.numOfReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length;
  } else {
    product.numOfReviews = 0;
    product.ratings = 0;
  }

  // 6. Save
  await product.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Review deleted successfully"));
});