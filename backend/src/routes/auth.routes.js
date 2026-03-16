// backend/src/routes/auth.routes.js

import { Router } from "express";
import {
  register,
  login,
  logout,
  getProfile,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no authentication needed)
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

// Protected routes (must be logged in)
router.get("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getProfile);

export default router;