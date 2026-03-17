// backend/src/controllers/cart.controller.js

import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ========================
//     ADD TO CART
// ========================
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // 1. Validate input
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  // 2. Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 3. Check if enough stock
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  // 4. Find or create cart for this user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  // 5. Check if product already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Product already in cart → update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    // Check stock for new quantity
    if (newQuantity > product.stock) {
      throw new ApiError(
        400,
        `Cannot add more. Only ${product.stock} items available. You already have ${cart.items[existingItemIndex].quantity} in cart.`
      );
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // New product → add to cart
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
    });
  }

  // 6. Save cart (pre-save hook will calculate totals)
  await cart.save();

  // 7. Populate product details for response
  await cart.populate("items.product", "name images stock");

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item added to cart successfully"));
});

// ========================
//      GET MY CART
// ========================
export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images stock price discountPrice"
  );

  if (!cart) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { items: [], totalPrice: 0, totalItems: 0 }, "Cart is empty")
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

// ========================
//   UPDATE CART QUANTITY
// ========================
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // 1. Validate
  if (!productId || !quantity) {
    throw new ApiError(400, "Product ID and quantity are required");
  }

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // 2. Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // 3. Find item in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  // 4. Check stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product no longer exists");
  }

  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  // 5. Update quantity
  cart.items[itemIndex].quantity = quantity;

  // 6. Save (totals auto-recalculated)
  await cart.save();
  await cart.populate("items.product", "name images stock");

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart updated successfully"));
});

// ========================
//  REMOVE ITEM FROM CART
// ========================
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // 1. Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // 2. Check if item exists in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  // 3. Remove item
  cart.items.splice(itemIndex, 1);

  // 4. Save
  await cart.save();
  await cart.populate("items.product", "name images stock");

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item removed from cart"));
});

// ========================
//     CLEAR ENTIRE CART
// ========================
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});