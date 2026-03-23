// frontend/src/redux/slices/productSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axios.js";

// ========================
// GET ALL PRODUCTS
// ========================
export const getAllProducts = createAsyncThunk(
  "product/getAll",
  async (queryParams = "", { rejectWithValue }) => {
    try {
      // queryParams = "keyword=iphone&category=electronics&page=1"
      const { data } = await api.get(`/products?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// ========================
// GET SINGLE PRODUCT
// ========================
export const getProductDetails = createAsyncThunk(
  "product/getDetails",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

// ========================
// SLICE
// ========================
const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],          // Array of all products
    product: null,         // Single product details
    totalProducts: 0,
    filteredProductsCount: 0,
    resultPerPage: 10,
    totalPages: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearProductDetails: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Products
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data.products;
        state.totalProducts = action.payload.data.totalProducts;
        state.filteredProductsCount = action.payload.data.filteredProductsCount;
        state.resultPerPage = action.payload.data.resultPerPage;
        state.totalPages = action.payload.data.totalPages;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Product
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.data;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError, clearProductDetails } = productSlice.actions;
export default productSlice.reducer;