// frontend/src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";

// Create the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,      // Manages user login/logout state
    // We'll add more slices later:
    // product: productReducer,
    // cart: cartReducer,
    // order: orderReducer,
  },
});

export default store;