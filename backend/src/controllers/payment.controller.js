// backend/src/controllers/payment.controller.js

import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ========================
//   GET RAZORPAY KEY
//   (Frontend needs this to open checkout)
// ========================
export const getRazorpayKey = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      { key: process.env.RAZORPAY_KEY_ID },
      "Razorpay key fetched"
    )
  );
});

// ========================
//   CREATE RAZORPAY ORDER
// ========================
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

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

  // 2. Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images stock price discountPrice"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  // 3. Verify stock for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      throw new ApiError(404, `Product "${item.product.name}" no longer exists`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `"${product.name}" has only ${product.stock} items in stock`
      );
    }
  }

  // 4. Calculate prices
  const itemsPrice = cart.totalPrice;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 500 ? 0 : 99;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // 5. Create Razorpay order
  const razorpayOrder = await razorpayInstance.orders.create({
    amount: totalPrice * 100, // Razorpay expects amount in PAISE (₹1 = 100 paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
      itemsCount: cart.items.length.toString(),
    },
  });

  if (!razorpayOrder) {
    throw new ApiError(500, "Failed to create Razorpay order");
  }

  // 6. Prepare order items (for saving after payment)
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.price,
    quantity: item.quantity,
    image: item.product.images[0]?.url || "https://via.placeholder.com/150",
  }));

  // 7. Create order in our database with status "Pending"
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentInfo: {
      id: razorpayOrder.id,
      status: "Pending",
      method: "Online",
    },
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderStatus: "Processing",
  });

  // 8. Send Razorpay order details to frontend
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        order: order._id,
        key: process.env.RAZORPAY_KEY_ID,
      },
      "Razorpay order created successfully"
    )
  );
});

// ========================
//   VERIFY PAYMENT
// ========================
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  // 1. Validate all fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    throw new ApiError(400, "Payment verification data is incomplete");
  }

  // 2. Create expected signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // 3. Compare signatures
  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    // Payment verification failed — possible fraud!
    await Order.findByIdAndUpdate(orderId, {
      "paymentInfo.status": "Failed",
      orderStatus: "Cancelled",
    });

    throw new ApiError(400, "Payment verification failed. Possible fraudulent transaction.");
  }

  // 4. Payment is VERIFIED ✅ — Update order
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.paymentInfo.id = razorpay_payment_id;
  order.paymentInfo.status = "Paid";
  order.paidAt = Date.now();

  await order.save();

  // 5. Decrease stock for each product
  for (const item of order.orderItems) {
    await updateStock(item.product, item.quantity);
  }

  // 6. Clear the cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        order,
        paymentId: razorpay_payment_id,
      },
      "Payment verified successfully! Order confirmed. 🎉"
    )
  );
});

// Helper: Update stock
async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);
  if (product) {
    product.stock -= quantity;
    await product.save();
  }
}

// ========================
//   RAZORPAY WEBHOOK
//   (Backup verification — Razorpay calls this)
// ========================
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // 1. Verify webhook signature
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  const receivedSignature = req.headers["x-razorpay-signature"];

  if (digest !== receivedSignature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  // 2. Handle payment event
  const event = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;

  if (event === "payment.captured") {
    // Find order by Razorpay order ID
    const order = await Order.findOne({
      "paymentInfo.id": paymentEntity.order_id,
    });

    if (order && order.paymentInfo.status !== "Paid") {
      order.paymentInfo.id = paymentEntity.id;
      order.paymentInfo.status = "Paid";
      order.paidAt = Date.now();
      await order.save();

      console.log(`✅ Webhook: Order ${order._id} payment confirmed`);
    }
  }

  if (event === "payment.failed") {
    const order = await Order.findOne({
      "paymentInfo.id": paymentEntity.order_id,
    });

    if (order) {
      order.paymentInfo.status = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();

      console.log(`❌ Webhook: Order ${order._id} payment failed`);
    }
  }

  // 3. Always return 200 to Razorpay (acknowledge receipt)
  return res.status(200).json({ received: true });
});