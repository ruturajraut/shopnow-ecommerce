// frontend/src/pages/product/Home.jsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProducts } from "../../redux/slices/productSlice.js";
import ProductCard from "../../components/product/ProductCard.jsx";
import Loader from "../../components/common/Loader.jsx";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);

  // Fetch products when page loads
  useEffect(() => {
    dispatch(getAllProducts("limit=8"));
    // ↑ Fetch only 8 products for homepage (featured)
  }, [dispatch]);

  return (
    <div>
      {/* ======================== */}
      {/*      HERO SECTION        */}
      {/* ======================== */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop the Best Products at Amazing Prices
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Discover electronics, clothing, books and more. 
              Free shipping on orders above ₹500!
            </p>
            <Link
              to="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
            >
              Shop Now →
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/*    CATEGORIES SECTION    */}
      {/* ======================== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: "Electronics", emoji: "📱" },
            { name: "Clothing", emoji: "👕" },
            { name: "Books", emoji: "📚" },
            { name: "Furniture", emoji: "🪑" },
            { name: "Sports", emoji: "⚽" },
            { name: "Beauty", emoji: "💄" },
          ].map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${category.name.toLowerCase()}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 text-center"
            >
              <span className="text-3xl block mb-2">{category.emoji}</span>
              <span className="text-sm font-medium text-gray-700">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================== */}
      {/*   FEATURED PRODUCTS      */}
      {/* ======================== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Products
          </h2>
          <Link
            to="/products"
            className="text-blue-600 font-medium hover:underline"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ======================== */}
      {/*     WHY CHOOSE US        */}
      {/* ======================== */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Shop with Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center">
              <span className="text-4xl block mb-3">🚚</span>
              <h3 className="font-bold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-500 text-sm">
                Free shipping on all orders above ₹500
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center">
              <span className="text-4xl block mb-3">🔒</span>
              <h3 className="font-bold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-500 text-sm">
                100% secure payment with Razorpay
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center">
              <span className="text-4xl block mb-3">↩️</span>
              <h3 className="font-bold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-500 text-sm">
                7-day easy return & refund policy
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;