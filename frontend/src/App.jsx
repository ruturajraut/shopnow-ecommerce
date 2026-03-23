// frontend/src/App.jsx

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { getProfile } from "./redux/slices/authSlice.js";

// Layout Components
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

// Pages
import Home from "./pages/product/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

const App = () => {
  const dispatch = useDispatch();

  // On app load → check if user is already logged in (has valid cookie)
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: "#333", color: "#fff" },
          }}
        />

        {/* Navbar — shows on ALL pages */}
        <Navbar />

        {/* Main Content — changes based on URL */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        {/* Footer — shows on ALL pages */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;