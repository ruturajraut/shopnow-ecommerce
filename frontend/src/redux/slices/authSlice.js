// frontend/src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axios.js";

// ========================
// ASYNC ACTIONS (API Calls)
// ========================

// Login API call
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", userData);
      // ↑ Calls POST http://localhost:5000/api/v1/auth/login
      return data; // Return data on success
    } catch (error) {
      // Return error message on failure
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Register API call
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Get Profile API call
export const getProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/profile");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Logout API call
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/logout");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

// ========================
// SLICE (State + Reducers)
// ========================
const authSlice = createSlice({
  name: "auth",

  // INITIAL STATE — starting values
  initialState: {
    user: null,              // No user logged in initially
    isAuthenticated: false,  // Not logged in
    loading: false,          // Not loading
    error: null,             // No errors
  },

  // REGULAR REDUCERS — for simple state changes
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  // EXTRA REDUCERS — handle async thunk results
  extraReducers: (builder) => {
    builder
      // ── LOGIN ──
      .addCase(loginUser.pending, (state) => {
        state.loading = true;   // Show loading spinner
        state.error = null;     // Clear previous errors
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;          // Hide spinner
        state.isAuthenticated = true;   // User is logged in!
        state.user = action.payload.data; // Save user data
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;          // Hide spinner
        state.isAuthenticated = false;  // Login failed
        state.user = null;
        state.error = action.payload;   // Save error message
      })

      // ── REGISTER ──
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // ── GET PROFILE ──
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // ── LOGOUT ──
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;