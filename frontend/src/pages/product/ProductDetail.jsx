// frontend/src/pages/product/ProductDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getProductDetails,
  clearProductDetails,
} from "../../redux/slices/productSlice.js";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import api from "../../utils/axios.js";

const ProductDetail = () => {
  // Get product ID from URL: /product/:id
  const { id } = useParams();
  // ↑ If URL is /product/69b7d7a2..., then id = "69b7d7a2..."

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { product, loading } = useSelector((state) => state.product);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Local state
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details when page loads
  useEffect(() => {
    dispatch(getProductDetails(id));

    // Cleanup when leaving this page
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    setAddingToCart(true);

    try {
      const { data } = await api.post("/cart", {
        productId: product._id,
        quantity: quantity,
      });
      toast.success("Added to cart! 🛒");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Star rating display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= Math.floor(rating) ? "text-yellow-400 text-xl" : "text-gray-300 text-xl"}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Loading state
  if (loading || !product) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ======================== */}
      {/*    BACK BUTTON            */}
      {/* ======================== */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back to Products
      </button>

      {/* ======================== */}
      {/*   PRODUCT MAIN SECTION    */}
      {/* ======================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT — Images */}
        <div>
          {/* Main Image */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <img
              src={
                product.images[selectedImage]?.url ||
                "https://via.placeholder.com/500?text=No+Image"
              }
              alt={product.name}
              className="w-full h-96 object-contain p-4"
            />
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Product Info */}
        <div>
          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>

          {/* Ratings */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{renderStars(product.ratings)}</div>
            <span className="text-gray-500">
              ({product.numOfReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-4">
            {product.discountPrice > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{product.discountPrice.toLocaleString()}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100
                  )}
                  % OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-24">Brand:</span>
              <span className="font-medium">{product.brand || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-24">Category:</span>
              <span className="font-medium capitalize">{product.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-24">Stock:</span>
              <span
                className={`font-medium ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Quantity Selector + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              {/* Quantity */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "🛒 Add to Cart"}
              </button>
            </div>
          )}

          {/* Out of Stock Message */}
          {product.stock === 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              This product is currently out of stock
            </div>
          )}
        </div>
      </div>

      {/* ======================== */}
      {/*      REVIEWS SECTION      */}
      {/* ======================== */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews ({product.numOfReviews})
        </h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">
                      {review.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;