// backend/makeAdmin.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ DB Connected");

    // Using the exact _id from your document
    const result = await mongoose.connection.db
      .collection("users")
      .updateOne(
        { _id: new mongoose.Types.ObjectId("69b7b1e6641a064cb7726630") },
        { $set: { role: "admin" } }
      );

    console.log("Modified count:", result.modifiedCount);

    if (result.modifiedCount === 1) {
      console.log("✅ Ruturaj is now ADMIN!");
    } else {
      console.log("⚠️ User not found or already admin");
    }

    // Verify the update
    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "ruturaj@gmail.com" });

    console.log("Current role:", user.role);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

makeAdmin();