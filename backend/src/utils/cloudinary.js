// backend/src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";

// ========================
//    UPLOAD IMAGE
// ========================
export const uploadOnCloudinary = async (fileBuffer, folder = "shopnow") => {
  try {
    // Convert file buffer to base64 string
    const base64String = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,          // Folder name on Cloudinary
      resource_type: "image",  // Type of file
    });

    // Return only what we need
    return {
      public_id: result.public_id,   // Unique ID (needed to delete later)
      url: result.secure_url,        // Image URL (https://...)
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

// ========================
//    DELETE IMAGE
// ========================
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;  // If no public_id, skip

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};