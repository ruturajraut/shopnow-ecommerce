# 🛒 ShopNow — MERN eCommerce Application

A full-stack, production-ready eCommerce platform built with **MongoDB, Express.js, React.js & Node.js**.

## ✨ Features

- 🔐 JWT Authentication (Access + Refresh Tokens with HTTP-Only Cookies)
- 🛍️ Product CRUD with Cloudinary Image Upload
- 🔍 Search, Filter, Sort & Pagination
- 🛒 Cart System (Add, Update, Remove, Clear)
- 📦 Order Management with Status Tracking
- 👨‍💼 Admin Panel (Products, Orders, Users)
- 📊 Stock Management (Auto decrease/restore)
- 🔒 Role-Based Authorization (User/Admin)

## 🚀 Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Cloudinary, Multer
**Frontend:** React.js, Redux Toolkit, Tailwind CSS *(Coming Soon)*

## 🛠️ Setup

```bash
# Clone
git clone https://github.com/ruturajraut/shopnow-ecommerce.git
cd shopnow-ecommerce/backend

# Install
npm install

# Configure
cp .env.example .env   # Fill in your values

# Run
npm run dev
📡 API Endpoints
Module	Method	Endpoint	Access
Auth	POST	/api/v1/auth/register	Public
Auth	POST	/api/v1/auth/login	Public
Auth	GET	/api/v1/auth/profile	Private
Products	GET	/api/v1/products	Public
Products	POST	/api/v1/products	Admin
Cart	POST	/api/v1/cart	Private
Cart	GET	/api/v1/cart	Private
Orders	POST	/api/v1/orders	Private
Orders	GET	/api/v1/orders/my-orders	Private
Orders	PUT	/api/v1/orders/admin/:id	Admin
📁 Structure
text

backend/src/
├── config/         # DB, Cloudinary, Multer
├── controllers/    # Auth, Product, Cart, Order
├── middlewares/    # Auth guard, Error handler
├── models/        # User, Product, Cart, Order
├── routes/        # API route definitions
├── utils/         # Helpers (ApiError, ApiResponse, etc.)
└── app.js         # Express configuration
👨‍💻 Author
Ruturaj Raut









