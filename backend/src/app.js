// backend/src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middlewares/error.middleware.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";   // ← ADD

const app = express();

// ========================
//      MIDDLEWARES
// ========================
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ========================
//     HEALTH CHECK
// ========================
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 API is running healthy!",
  });
});

// ========================
//       ROUTES
// ========================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);   // ← ADD

// ========================
//    ERROR HANDLER
// ========================
app.use(errorHandler);

export default app;