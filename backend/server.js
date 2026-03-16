// backend/server.js

import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import connectCloudinary from "./src/config/cloudinary.js";

// Load environment variables FIRST
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to DB, then start server
connectDB()
  .then(() => {
    connectCloudinary();

    app.listen(PORT, () => {
      console.log(`⚙️  Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  });