// backend/src/utils/seedAdmin.js
// Run ONCE: node src/utils/seedAdmin.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOneAndUpdate(
      { email: "ruturaj@gmail.com" },   // ← Your email
      { role: "admin" },
      { new: true }
    );

    console.log("✅ User is now admin:", user.name);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

makeAdmin();