# E-commerce Backend API Documentation

## API Routes Overview

This backend application has **53 routes** implemented across 7 main modules.

---

## 📦 Product Routes (20 routes)
**Base URL:** `/api/v1/product`

### Product Management
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/create-product` | Create a new product | Admin Only |
| PUT | `/update-product/:pid` | Update product by ID | Admin Only |
| GET | `/get-product` | Get all products (limit 12) | Public |
| GET | `/get-product/:slug` | Get single product by slug | Public |
| GET | `/product-photo/:pid` | Get product photo | Public |
| DELETE | `/delete-product/:pid` | Delete product by ID | Public |

### Product Filters & Search
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/product-filters` | Filter products by category/price | Public |
| GET | `/product-count` | Get total product count | Public |
| GET | `/product-list/:page` | Get products with pagination | Public |
| GET | `/search/:keyword` | Search products by keyword | Public |
| GET | `/related-product/:pid/:cid` | Get related products | Public |
| GET | `/product-category/:slug` | Get products by category | Public |

### Payment Integration (Razorpay)
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/razorpay/key` | Get Razorpay public key | Public |
| POST | `/razorpay/order` | Create Razorpay order | User Required |
| POST | `/razorpay/payment` | Verify Razorpay payment | User Required |

### Product Reviews
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/review/:pid` | Add product review | User Required |
| DELETE | `/review/:id` | Delete product review | User/Admin |
| GET | `/reviews/:pid` | Get product reviews | Public |

---

## 🔐 Authentication Routes (11 routes)
**Base URL:** `/api/v1/auth`

### User Authentication
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/forget-password` | Reset password | Public |
| GET | `/test` | Test route | Admin Only |

### Auth Verification
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/user-auth` | Verify user authentication | User Required |
| GET | `/admin-auth` | Verify admin authentication | Admin Only |

### User Profile
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| PUT | `/profile` | Update user profile | User Required |

### Order Management
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/orders` | Get user orders | User Required |
| GET | `/all-orders` | Get all orders | Admin Only |
| PUT | `/order-status/:orderId` | Update order status | Admin Only |

---

## 📑 Category Routes (5 routes)
**Base URL:** `/api/v1/category`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/create-category` | Create new category | Admin Only |
| PUT | `/update-category/:id` | Update category | Admin Only |
| GET | `/get-category` | Get all categories | Public |
| GET | `/single-category/:slug` | Get single category | Public |
| DELETE | `/delete-category/:id` | Delete category | Admin Only |

---

## ❤️ Wishlist Routes (4 routes)
**Base URL:** `/api/v1/wishlist`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/add/:pid` | Add product to wishlist | User Required |
| DELETE | `/remove/:pid` | Remove product from wishlist | User Required |
| GET | `/` | Get user's wishlist | User Required |
| GET | `/count` | Get wishlist items count | User Required |

---

## 📊 Analytics Routes (4 routes)
**Base URL:** `/api/v1/analytics`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/overview` | Get total revenue & orders | Admin Only |
| GET | `/daily-sales` | Get daily sales data | Admin Only |
| GET | `/monthly-sales` | Get monthly sales data | Admin Only |
| GET | `/top-products` | Get best-selling products | Admin Only |

---

## 🎟️ Coupon Routes (6 routes)
**Base URL:** `/api/v1/coupon`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/create` | Create new coupon | Admin Only |
| GET | `/all` | Get all coupons | Public |
| POST | `/apply` | Apply coupon & calculate discount | User Required |
| DELETE | `/delete/:id` | Delete coupon | Admin Only |
| PUT | `/update/:id` | Update coupon | Admin Only |
| PUT | `/toggle/:id` | Activate/Deactivate coupon | Admin Only |

---

## 🔑 Authentication Middleware

- **requireSignIn**: Validates JWT token for logged-in users
- **isAdmin**: Verifies admin role (requires requireSignIn)

---

## 💳 Payment Gateway

**Razorpay Integration:**

- Create orders with dynamic amount
- Secure payment verification with signature validation
- Automatic order creation on successful payment

---

## ⭐ Product Reviews

**Review System:**

- Users can add reviews with ratings (1-5 stars)
- One review per user per product
- Users can delete their own reviews
- Average rating calculation
- Admin can delete any review

---

## ❤️ Wishlist Features

**Wishlist Management:**

- Add/remove products to personal wishlist
- Fetch complete wishlist with product details
- Track wishlist item count
- Prevent duplicate entries

---

## 📊 Analytics Dashboard

**Admin Analytics:**

- Overview: Total revenue, orders, products, pending orders
- Daily sales data with customizable date range
- Monthly sales trends
- Top-selling products report

---

## 🎟️ Coupon System

**Discount Features:**

- Create percentage or fixed amount coupons
- Set minimum purchase requirements
- Maximum discount limits for percentage coupons
- Expiry date and usage limits
- Real-time discount calculation
- Track coupon usage statistics
- Activate/Deactivate coupons

**Coupon Fields:**
- **Code**: Unique coupon code (auto-uppercase)
- **Discount Type**: Percentage or Fixed amount
- **Discount Value**: Amount or percentage off
- **Min Purchase**: Minimum cart value required
- **Max Discount**: Maximum discount for percentage coupons
- **Expiry Date**: Coupon validity period
- **Usage Limit**: Maximum times coupon can be used

---

## 📊 Summary

| Module | Total Routes |
|--------|--------------|
| Products | 20 |
| Authentication | 11 |
| Categories | 5 |
| Wishlist | 4 |
| Analytics | 4 |
| Coupons | 6 |
| Reviews | 3 |
| **Total** | **53** |

### Route Distribution by Access Level

- **Public Routes:** 19
- **User Protected Routes:** 14
- **Admin Protected Routes:** 20

---

## 🛠️ Technologies Used

- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Razorpay Payment Gateway
- Bcrypt.js for password hashing
- Express-formidable for file uploads
- Crypto for payment signature verification

---

## 📁 Project Structure

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── productController.js
│   ├── wishlistController.js
│   ├── analyticsController.js
│   └── couponController.js
├── models/
│   ├── userModel.js
│   ├── productModel.js
│   ├── categoryModel.js
│   ├── orderModel.js
│   ├── reviewModel.js
│   └── couponModel.js
├── routes/
│   ├── authRoute.js
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   ├── wishlistRoutes.js
│   ├── analyticsRoutes.js
│   └── couponRoutes.js
├── middlewares/
│   └── authMiddleware.js
├── helpers/
│   └── authHelper.js
└── server.js
```
