// frontend/src/pages/product/ProductList.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getAllProducts } from "../../redux/slices/productSlice.js";
import ProductCard from "../../components/product/ProductCard.jsx";
import Loader from "../../components/common/Loader.jsx";

const ProductList = () => {
  const dispatch = useDispatch();

  // URL search params (e.g., /products?category=electronics)
  const [searchParams, setSearchParams] = useSearchParams();

  // Get data from Redux store
  const { products, loading, filteredProductsCount, resultPerPage, totalPages } =
    useSelector((state) => state.product);

  // Local state for filters
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Categories list
  const categories = [
    "all",
    "electronics",
    "clothing",
    "furniture",
    "books",
    "sports",
    "beauty",
    "grocery",
    "toys",
    "other",
  ];

  // Build query string from filters
  const buildQueryString = () => {
    let query = `page=${page}&limit=8`;

    if (keyword) query += `&keyword=${keyword}`;
    if (category && category !== "all") query += `&category=${category}`;
    if (sort) query += `&sort=${sort}`;

    return query;
  };

  // Fetch products when filters change
  useEffect(() => {
    const queryString = buildQueryString();
    dispatch(getAllProducts(queryString));

    // Update URL with current filters
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category && category !== "all") params.category = category;
    if (sort) params.sort = sort;
    if (page > 1) params.page = page;
    setSearchParams(params);
  }, [keyword, category, sort, page, dispatch]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  };

  // Handle category click
  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setKeyword("");
    setCategory("");
    setSort("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ======================== */}
      {/*    PAGE HEADER            */}
      {/* ======================== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-500">
          {filteredProductsCount} products found
        </p>
      </div>

      {/* ======================== */}
      {/*  SEARCH & FILTER BAR     */}
      {/* ======================== */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={handleSortChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Sort By</option>
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-ratings">Highest Rated</option>
          </select>

          {/* Clear Filters */}
          {(keyword || category || sort) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ======================== */}
      {/*   CATEGORY PILLS          */}
      {/* ======================== */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat || (cat === "all" && !category)
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600 hover:text-blue-600"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* ======================== */}
      {/*    PRODUCTS GRID          */}
      {/* ======================== */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-500 mb-4">
            Try changing your search or filters
          </p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* ======================== */}
          {/*     PAGINATION            */}
          {/* ======================== */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {/* Previous Button */}
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              {/* Next Button */}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;