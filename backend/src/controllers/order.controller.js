// backend/src/controllers/order.controller.js

import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ========================
//      PLACE ORDER
// ========================
// export const placeOrder = asyncHandler(async (req, res) => {
//   const { shippingAddress, paymentMethod = "COD" } = req.body;

//   // 1. Validate shipping address
//   if (
//     !shippingAddress ||
//     !shippingAddress.address ||
//     !shippingAddress.city ||
//     !shippingAddress.state ||
//     !shippingAddress.pinCode ||
//     !shippingAddress.phone
//   ) {
//     throw new ApiError(400, "Complete shipping address is required");
//   }

//   // 2. Get user's cart
//   const cart = await Cart.findOne({ user: req.user._id }).populate(
//     "items.product",
//     "name images stock price discountPrice"
//   );

//   if (!cart || cart.items.length === 0) {
//     throw new ApiError(400, "Your cart is empty. Add items before placing order.");
//   }

//   // 3. Verify stock for all items
//   for (const item of cart.items) {
//     const product = await Product.findById(item.product._id);

//     if (!product) {
//       throw new ApiError(
//         404,
//         `Product "${item.product.name}" is no longer available`
//       );
//     }

//     if (product.stock < item.quantity) {
//       throw new ApiError(
//         400,
//         `"${product.name}" has only ${product.stock} items in stock. You requested ${item.quantity}.`
//       );
//     }
//   }

//   // 4. Prepare order items
//   const orderItems = cart.items.map((item) => ({
//     product: item.product._id,
//     name: item.product.name,
//     price: item.price,
//     quantity: item.quantity,
//     image: item.product.images[0]?.url || "https://via.placeholder.com/150",
//   }));

//   // 5. Calculate prices
//   const itemsPrice = cart.totalPrice;
//   const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST
//   const shippingPrice = itemsPrice > 500 ? 0 : 99; // Free shipping above ₹500
//   const totalPrice = itemsPrice + taxPrice + shippingPrice;

//   // 6. Create order
//   const order = await Order.create({
//     user: req.user._id,
//     orderItems,
//     shippingAddress,
//     paymentInfo: {
//       method: paymentMethod,
//       status: paymentMethod === "COD" ? "Pending" : "Paid",
//     },
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//     paidAt: paymentMethod === "Online" ? Date.now() : undefined,
//   });

//   // 7. Decrease stock for each product
//   for (const item of cart.items) {
//     await updateStock(item.product._id, item.quantity);
//   }

//   // 8. Clear the cart
//   cart.items = [];
//   await cart.save();

//   return res
//     .status(201)
//     .json(new ApiResponse(201, order, "Order placed successfully! 🎉"));
// });
// backend/src/controllers/order.controller.js

export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "COD" } = req.body;

  // 1. Validate shipping address
  if (
    !shippingAddress ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.pinCode ||
    !shippingAddress.phone
  ) {
    throw new ApiError(400, "Complete shipping address is required");
  }

  // 2. If payment method is Online → redirect to Razorpay flow
  if (paymentMethod === "Online") {
    throw new ApiError(
      400,
      "For online payment, use /api/v1/payments/create-order endpoint"
    );
  }

  // 3. Get user's cart (COD flow continues here)
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images stock price discountPrice"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty. Add items before placing order.");
  }

  // 4. Verify stock for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      throw new ApiError(
        404,
        `Product "${item.product.name}" is no longer available`
      );
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `"${product.name}" has only ${product.stock} items in stock`
      );
    }
  }

  // 5. Prepare order items
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.price,
    quantity: item.quantity,
    image: item.product.images[0]?.url || "https://via.placeholder.com/150",
  }));

  // 6. Calculate prices
  const itemsPrice = cart.totalPrice;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 500 ? 0 : 99;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // 7. Create order (COD)
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentInfo: {
      id: "COD_" + Date.now(),
      status: "Pending",
      method: "COD",
    },
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // 8. Decrease stock
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    product.stock -= item.quantity;
    await product.save();
  }

  // 9. Clear cart
  cart.items = [];
  await cart.save();

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully (COD)! 🎉"));
});
// Helper function to update stock
async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);
  product.stock -= quantity;
  await product.save();
}

// ========================
//     GET MY ORDERS
// ========================
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort("-createdAt")
    .populate("user", "name email");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { orders, totalOrders: orders.length },
        "Orders fetched successfully"
      )
    );
});

// ========================
//   GET SINGLE ORDER
// ========================
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if the order belongs to the logged-in user OR user is admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You are not authorized to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// ========================
//   GET ALL ORDERS (Admin)
// ========================
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort("-createdAt")
    .populate("user", "name email");

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          orders,
          totalOrders: orders.length,
          totalRevenue,
        },
        "All orders fetched successfully"
      )
    );
});

// ========================
//  UPDATE ORDER STATUS (Admin)
// ========================
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Order status is required");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if order is already delivered
  if (order.orderStatus === "Delivered") {
    throw new ApiError(400, "This order has already been delivered");
  }

  // Check if order is cancelled
  if (order.orderStatus === "Cancelled") {
    throw new ApiError(400, "This order has been cancelled");
  }

  // Validate status transition
  const validTransitions = {
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
  };

  const allowedStatuses = validTransitions[order.orderStatus];

  if (!allowedStatuses || !allowedStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Cannot change status from "${order.orderStatus}" to "${status}". Allowed: ${allowedStatuses?.join(", ")}`
    );
  }

  // If cancelled → restore stock
  if (status === "Cancelled") {
    for (const item of order.orderItems) {
      await restoreStock(item.product, item.quantity);
    }
  }

  // Update status
  order.orderStatus = status;

  if (status === "Delivered") {
    order.deliveredAt = Date.now();
    order.paymentInfo.status = "Paid";
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, `Order status updated to "${status}"`));
});

// Helper function to restore stock (when order is cancelled)
async function restoreStock(productId, quantity) {
  const product = await Product.findById(productId);
  if (product) {
    product.stock += quantity;
    await product.save();
  }
}

// ========================
//   DELETE ORDER (Admin)
// ========================
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await Order.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Order deleted successfully"));
});