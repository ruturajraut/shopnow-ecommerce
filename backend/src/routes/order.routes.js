// backend/src/routes/order.routes.js

import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// All order routes require authentication
router.use(isAuthenticated);

// ========================
//     USER ROUTES
// ========================
router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);

// ========================
//     ADMIN ROUTES
// ========================
router.get("/admin/all", authorizeRoles("admin"), getAllOrders);
router.put("/admin/:id", authorizeRoles("admin"), updateOrderStatus);
router.delete("/admin/:id", authorizeRoles("admin"), deleteOrder);

// ========================
//   USER + ADMIN ROUTE
// ========================
router.get("/:id", getOrderById); // Controller checks ownership

export default router;