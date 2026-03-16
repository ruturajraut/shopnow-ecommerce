// backend/src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ========================
//   PROTECT ROUTES
// ========================
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  // 1. Get token from cookies OR Authorization header
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Please login to access this resource");
  }

  // 2. Verify the token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired. Please refresh your token.");
    }
    throw new ApiError(401, "Invalid access token. Please login again.");
  }

  // 3. Find user from token data
  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "User belonging to this token no longer exists");
  }

  // 4. Attach user to request object
  req.user = user;

  // 5. Move to next middleware/controller
  next();
});

// ========================
//   AUTHORIZE ROLES
// ========================
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role: '${req.user.role}' is not allowed to access this resource`
      );
    }
    next();
  };
};