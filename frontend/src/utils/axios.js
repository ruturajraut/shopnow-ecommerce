// frontend/src/utils/axios.js

import axios from "axios";

// Create a reusable axios instance
const api = axios.create({
  baseURL: "/api/v1",      // All API calls start with /api/v1
  withCredentials: true,    // Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;