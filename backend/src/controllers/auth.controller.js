// backend/src/controllers/auth.controller.js

import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateTokens from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";

// ========================
//       REGISTER
// ========================
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if all fields are provided
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // 3. Create new user (password will be hashed by pre-save middleware)
  const user = await User.create({
    name,
    email,
    password,
  });

  // 4. Generate tokens and set cookies
  const { accessToken } = await generateTokens(user, res);

  // 5. Remove sensitive fields from response
  const createdUser = await User.findById(user._id);
  // 👆 This query won't include password & refreshToken (select: false)

  // 6. Send response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// ========================
//         LOGIN
// ========================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Check if fields are provided
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 2. Find user and explicitly include password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 3. Compare password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 4. Generate tokens and set cookies
  await generateTokens(user, res);

  // 5. Get user without sensitive fields
  const loggedInUser = await User.findById(user._id);

  // 6. Send response
  return res
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "Logged in successfully"));
});

// ========================
//        LOGOUT
// ========================
export const logout = asyncHandler(async (req, res) => {
  // 1. Remove refresh token from database
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }, // Remove the field from document
  });

  // 2. Cookie options for clearing
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // 3. Clear cookies
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// ========================
//      GET PROFILE
// ========================
export const getProfile = asyncHandler(async (req, res) => {
  // req.user is set by auth middleware
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

// ========================
//     REFRESH TOKEN
// ========================
export const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. Get refresh token from cookies
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not found. Please login again.");
  }

  // 2. Verify the refresh token
  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token. Please login again.");
  }

  // 3. Find user with this refresh token
  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "User not found. Please login again.");
  }

  // 4. Check if refresh token matches the one in DB
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is expired or has been used. Please login again.");
  }

  // 5. Generate new tokens
  await generateTokens(user, res);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Access token refreshed successfully"));
});