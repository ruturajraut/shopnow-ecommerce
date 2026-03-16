// backend/src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middlewares/error.middleware.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";    // ← ADD

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
app.use("/api/v1/products", productRoutes);   // ← ADD

// ========================
//    ERROR HANDLER
// ========================
app.use(errorHandler);

export default app;