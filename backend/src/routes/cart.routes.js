// backend/src/routes/cart.routes.js

import { Router } from "express";
import {
  addToCart,
  getMyCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// All cart routes require authentication
router.use(isAuthenticated);

router.post("/", addToCart);
router.get("/", getMyCart);
router.put("/", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:productId", removeFromCart);

export default router;