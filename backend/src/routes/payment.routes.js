// backend/src/routes/payment.routes.js

import { Router } from "express";
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/payment.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route — Razorpay calls this directly (no auth)
router.post("/webhook", razorpayWebhook);

// Protected routes — user must be logged in
router.get("/get-key", isAuthenticated, getRazorpayKey);
router.post("/create-order", isAuthenticated, createRazorpayOrder);
router.post("/verify", isAuthenticated, verifyPayment);

export default router;