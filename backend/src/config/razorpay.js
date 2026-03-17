// backend/src/config/razorpay.js

import Razorpay from "razorpay";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug: Check if variables exist (remove this after debugging)
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✅ Loaded" : "❌ Missing");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing");

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay credentials are missing in environment variables");
  process.exit(1); // Exit the process if credentials are missing
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpayInstance;