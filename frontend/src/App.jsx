// frontend/src/App.jsx

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { getProfile } from "./redux/slices/authSlice.js";

// Layout
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

// Pages
import Home from "./pages/product/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ProductList from "./pages/product/ProductList.jsx";       // ← ADD
import ProductDetail from "./pages/product/ProductDetail.jsx";   // ← ADD

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: "#333", color: "#fff" },
          }}
        />

        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />        {/* ← ADD */}
            <Route path="/product/:id" element={<ProductDetail />} />   {/* ← ADD */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;