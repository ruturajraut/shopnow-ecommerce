// backend/src/controllers/admin.controller.js

import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// ========================
//   DASHBOARD STATS
// ========================
export const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Count totals
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // 2. Calculate total revenue (only from delivered/paid orders)
  const revenueData = await Order.aggregate([
    {
      $match: {
        $or: [
          { orderStatus: "Delivered" },
          { "paymentInfo.status": "Paid" },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalPaidOrders: { $sum: 1 },
      },
    },
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;
  const totalPaidOrders = revenueData[0]?.totalPaidOrders || 0;

  // 3. Pending orders count
  const pendingOrders = await Order.countDocuments({
    orderStatus: "Processing",
  });

  // 4. Out of stock products
  const outOfStock = await Product.countDocuments({ stock: 0 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalPaidOrders,
        pendingOrders,
        outOfStock,
      },
      "Dashboard stats fetched successfully"
    )
  );
});

// ========================
//   MONTHLY REVENUE
//   (For Chart on Frontend)
// ========================
export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();

  const monthlyRevenue = await Order.aggregate([
    {
      // Filter orders for the given year
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
        $or: [
          { orderStatus: "Delivered" },
          { "paymentInfo.status": "Paid" },
        ],
      },
    },
    {
      // Group by month
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    {
      // Sort by month (1-12)
      $sort: { _id: 1 },
    },
  ]);

  // Fill all 12 months (even months with 0 revenue)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const formattedData = months.map((month, index) => {
    const found = monthlyRevenue.find((item) => item._id === index + 1);
    return {
      month,
      revenue: found?.revenue || 0,
      orders: found?.orders || 0,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { year, data: formattedData },
      "Monthly revenue fetched successfully"
    )
  );
});

// ========================
//   ORDER STATUS DISTRIBUTION
//   (For Pie Chart)
// ========================
export const getOrderStatusDistribution = asyncHandler(async (req, res) => {
  const distribution = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  // Format for frontend
  const totalOrders = distribution.reduce((sum, item) => sum + item.count, 0);

  const formattedData = distribution.map((item) => ({
    status: item._id,
    count: item.count,
    percentage: totalOrders > 0
      ? Math.round((item.count / totalOrders) * 100)
      : 0,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { distribution: formattedData, totalOrders },
      "Order status distribution fetched"
    )
  );
});

// ========================
//   RECENT ORDERS
// ========================
export const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const recentOrders = await Order.find()
    .sort("-createdAt")
    .limit(limit)
    .populate("user", "name email")
    .select("orderItems totalPrice orderStatus paymentInfo createdAt");

  return res.status(200).json(
    new ApiResponse(200, recentOrders, "Recent orders fetched")
  );
});

// ========================
//   LOW STOCK PRODUCTS
// ========================
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || 10;

  const lowStockProducts = await Product.find({ stock: { $lte: threshold } })
    .sort("stock")
    .select("name stock price images category");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: lowStockProducts,
        count: lowStockProducts.length,
        threshold,
      },
      "Low stock products fetched"
    )
  );
});

// ========================
//   GET ALL USERS
// ========================
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      { users, totalUsers: users.length },
      "All users fetched successfully"
    )
  );
});

// ========================
//   GET SINGLE USER
// ========================
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// ========================
//   UPDATE USER ROLE
// ========================
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  if (!["user", "admin"].includes(role)) {
    throw new ApiError(400, "Role must be 'user' or 'admin'");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent admin from changing their own role
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, "You cannot change your own role");
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, `User role updated to '${role}'`));
});

// ========================
//   DELETE USER
// ========================
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  // Delete user avatar from Cloudinary if exists
  if (user.avatar && user.avatar.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  await User.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});