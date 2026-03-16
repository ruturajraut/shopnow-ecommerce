// backend/src/controllers/product.controller.js

import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// ========================
//    CREATE PRODUCT
//    (Admin Only)
// ========================
export const createProduct = asyncHandler(async (req, res) => {
  // 1. Get product data from request body
  const { name, description, price, discountPrice, category, stock, brand } =
    req.body;

  // 2. Validate required fields
  if (!name || !description || !price || !category) {
    throw new ApiError(400, "Name, description, price, and category are required");
  }

  // 3. Handle image uploads
  let images = [];

  if (req.files && req.files.length > 0) {
    // Upload each image to Cloudinary
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.buffer, "shopnow/products");
      images.push({
        public_id: result.public_id,
        url: result.url,
      });
    }
  }

  // 4. Create product
  const product = await Product.create({
    name,
    description,
    price,
    discountPrice: discountPrice || 0,
    category,
    stock: stock || 0,
    brand,
    images,
    seller: req.user._id, // Admin who created this product
  });

  // 5. Send response
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// ========================
//    GET ALL PRODUCTS
//    (Public — with Search, Filter, Pagination)
// ========================
export const getAllProducts = asyncHandler(async (req, res) => {
  const resultPerPage = Number(req.query.limit) || 10;

  // Count total products (for frontend pagination info)
  const totalProducts = await Product.countDocuments();

  // Apply search, filter, sort, pagination
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .paginate(resultPerPage);

  const products = await apiFeatures.query;

  // Count filtered products (after search & filter, before pagination)
  const filteredApiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  const filteredProducts = await filteredApiFeatures.query;
  const filteredProductsCount = filteredProducts.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        totalProducts,
        filteredProductsCount,
        resultPerPage,
        currentPage: Number(req.query.page) || 1,
        totalPages: Math.ceil(filteredProductsCount / resultPerPage),
      },
      "Products fetched successfully"
    )
  );
});

// ========================
//    GET SINGLE PRODUCT
//    (Public)
// ========================
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "seller",
    "name email"
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// ========================
//    UPDATE PRODUCT
//    (Admin Only)
// ========================
export const updateProduct = asyncHandler(async (req, res) => {
  // 1. Find existing product
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 2. Handle new image uploads
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id);
    }

    // Upload new images
    let newImages = [];
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.buffer, "shopnow/products");
      newImages.push({
        public_id: result.public_id,
        url: result.url,
      });
    }

    req.body.images = newImages;
  }

  // 3. Update product
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,           // Return updated document
    runValidators: true, // Run schema validations on update
  });

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// ========================
//    DELETE PRODUCT
//    (Admin Only)
// ========================
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete images from Cloudinary
  for (const image of product.images) {
    await deleteFromCloudinary(image.public_id);
  }

  // Delete product from database
  await Product.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

// ========================
//    GET ADMIN PRODUCTS
//    (Admin Only — no pagination)
// ========================
export const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("-createdAt");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, totalProducts: products.length },
        "Admin products fetched"
      )
    );
});