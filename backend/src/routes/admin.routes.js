// backend/src/routes/admin.routes.js

import { Router } from "express";
import {
  getDashboardStats,
  getMonthlyRevenue,
  getOrderStatusDistribution,
  getRecentOrders,
  getLowStockProducts,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/admin.controller.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(isAuthenticated, authorizeRoles("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/order-status", getOrderStatusDistribution);
router.get("/recent-orders", getRecentOrders);
router.get("/low-stock", getLowStockProducts);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;