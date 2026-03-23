// frontend/src/components/product/ProductCard.jsx

import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // Destructure product data
  const { _id, name, price, discountPrice, images, ratings, numOfReviews, stock } = product;

  // Calculate discount percentage
  const discountPercent = discountPrice > 0
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);  // Full star
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);  // Half star (simplified)
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);   // Empty star
      }
    }
    return stars;
  };

  return (
    <Link to={`/product/${_id}`} className="block">
      {/* ↑ Clicking the card goes to product detail page */}

      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          <img
            src={images[0]?.url || "https://via.placeholder.com/300?text=No+Image"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </span>
          )}

          {/* Out of Stock Badge */}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="text-gray-800 font-semibold text-sm line-clamp-2 mb-2">
            {name}
          </h3>

          {/* Stars & Reviews */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">{renderStars(ratings)}</div>
            <span className="text-xs text-gray-500">({numOfReviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {discountPrice > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  ₹{discountPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ₹{price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;