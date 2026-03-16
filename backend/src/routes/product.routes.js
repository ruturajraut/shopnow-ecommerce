// backend/src/routes/product.routes.js  (CORRECTED ORDER)

import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAdminProducts,
} from "../controllers/product.controller.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../config/multer.js";

const router = Router();

// ========================
//     ADMIN ROUTES (specific path — MUST come first)
// ========================
router.get(
  "/admin/all",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminProducts
);

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.array("images", 5),
  createProduct
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.array("images", 5),
  updateProduct
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteProduct
);

// ========================
//     PUBLIC ROUTES (dynamic :id — comes last)
// ========================
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;