// backend/src/config/multer.js

import multer from "multer";

// Store files in MEMORY (as buffer) — we'll upload to Cloudinary, not save locally
const storage = multer.memoryStorage();

// File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);   // Accept file
  } else {
    cb(new Error("Only .jpeg, .jpg, .png, .webp files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

export default upload;