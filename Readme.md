# Karma E-Commerce Backend

A comprehensive Node.js backend API for an e-commerce platform with complete user management, product catalog, cart functionality, order processing, and more.

![Karma E-Commerce](karma.jpg)

## 🚀 Features

- **User Authentication** - Complete auth system with JWT, email verification, password recovery
- **Social Login** - Google OAuth integration for seamless login experience
- **Product Management** - Products with categories, subcategories, brands, and reviews
- **Shopping Cart** - Fully functional cart system
- **Order Processing** - End-to-end order management
- **Payment Integration** - Secure payment processing with Stripe
- **Coupons System** - Discounts with automatic expiration handling
- **Cloud Storage** - Image uploads with Cloudinary
- **PDF Generation** - Order invoices with PDFKit
- **QR Codes** - Generate QR codes for products and orders
- **Email Notifications** - Automated emails for various events
- **Admin Dashboard** - Complete system administration

## 📋 Prerequisites

- Node.js (v20.11.1 recommended)
- MongoDB
- Cloudinary account
- Stripe account (for payments)
- SMTP server for email
- Google Developer Console project (for Google OAuth)

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
DATABASE_URL=mongodb://localhost:27017/karma-ecommerce
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:your_frontend_port

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=your_oauth_redirect_url
```

## 🛠️ Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/karma-e-commerce-backend.git
cd karma-e-commerce-backend
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. For production

```bash
npm start
```

## 📁 Project Structure

```
karma-e-commerce-backend/
├── api/
│   └── server.js                # Express server setup
├── DB/
│   ├── connection.js            # MongoDB connection
│   └── models/                  # Database models
│       ├── Brand.model.js
│       ├── Cart.model.js
│       ├── Category.model.js
│       ├── Coupon.model.js
│       ├── Home.model.js
│       ├── Order.model.js
│       ├── Product.model.js
│       ├── Review.model.js
│       ├── SubCategory.model.js
│       └── User.model.js
├── src/
│   ├── initial/                 # App initialization
│   │   ├── index.js
│   │   └── routes.all.js
│   ├── lib/                     # Core utilities
│   │   ├── apiFeatures.js       # API features (filtering, sorting, etc.)
│   │   ├── cloudinary.cloud.js  # Cloudinary integration
│   │   ├── errorHandler.js      # Error handling
│   │   └── sendError.js         # Error formatting
│   ├── middlewares/             # Express middlewares
│   │   ├── auth.js              # Authentication middleware
│   │   └── validations.js       # Input validation
│   ├── modules/                 # Feature modules
│   │   ├── auth/                # Authentication module
│   │   ├── brands/              # Brands module
│   │   ├── cart/                # Cart module
│   │   ├── categories/          # Categories module
│   │   ├── coupons/             # Coupons module
│   │   ├── home/                # Home module
│   │   ├── order/               # Order module
│   │   ├── products/            # Products module
│   │   ├── review/              # Review module
│   │   └── subCategories/       # SubCategories module
│   ├── services/                # External services
│   │   ├── payment.js           # Payment processing
│   │   ├── sendEmail.js         # Email service
│   │   └── uploadFiles.cloud.js # File uploads
│   └── utils/                   # Helper utilities
│       ├── couponValidations.js # Coupon validation
│       ├── crons.js             # Scheduled tasks
│       ├── pagination.js        # Pagination utility
│       ├── pdfkit.js            # PDF generation
│       ├── qrCode.js            # QR code generation
│       ├── systemRoles.js       # User roles
│       ├── template.email.js    # Email templates
│       └── useToken.js          # JWT token utility
└── FilesPDF/                    # Generated PDF files
```

## 🔄 API Endpoints

### Auth

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login
- `GET /auth/verify/:token` - Email verification
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback handler
- `POST /auth/google/login` - Login with Google Auth token

### Categories

- `GET /categories` - Get all categories
- `POST /categories` - Create a category
- `GET /categories/:id` - Get a category by ID
- `PUT /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

### SubCategories

- `GET /sub-categories` - Get all subcategories
- `POST /sub-categories` - Create a subcategory
- `GET /sub-categories/:id` - Get a subcategory by ID
- `PUT /sub-categories/:id` - Update a subcategory
- `DELETE /sub-categories/:id` - Delete a subcategory

### Brands

- `GET /brands` - Get all brands
- `POST /brands` - Create a brand
- `GET /brands/:id` - Get a brand by ID
- `PUT /brands/:id` - Update a brand
- `DELETE /brands/:id` - Delete a brand

### Products

- `GET /products` - Get all products
- `POST /products` - Create a product
- `GET /products/:id` - Get a product by ID
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

### Cart

- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove item from cart

### Orders

- `GET /order` - Get user's orders
- `POST /order` - Create an order
- `GET /order/:id` - Get order by ID
- `PUT /order/:id/status` - Update order status
- `GET /order/:id/invoice` - Generate order invoice

### Coupons

- `GET /coupons` - Get all coupons
- `POST /coupons` - Create a coupon
- `GET /coupons/:id` - Get a coupon by ID
- `PUT /coupons/:id` - Update a coupon
- `DELETE /coupons/:id` - Delete a coupon

### Reviews

- `GET /review/product/:productId` - Get reviews for a product
- `POST /review/product/:productId` - Create a review
- `PUT /review/:id` - Update a review
- `DELETE /review/:id` - Delete a review

## 🧰 Technologies Used

- **Express** - Fast, unopinionated web framework
- **MongoDB with Mongoose** - Database and ORM
- **JWT** - Secure authentication
- **Google Auth Library** - Google OAuth integration
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage for images
- **Nodemailer** - Email sending
- **PDFKit** - PDF generation
- **QRCode** - QR code generation
- **Stripe** - Payment processing
- **Node-schedule** - Task scheduling

## 💡 Advanced Features

- **API Features** - Filtering, sorting, pagination, and search
- **Error Handling** - Centralized error handling with appropriate status codes
- **Input Validation** - Request validation with Joi
- **Authentication** - JWT-based auth with role management
- **OAuth Integration** - Google authentication for social login
- **File Upload** - Image uploads to Cloudinary
- **Scheduled Tasks** - Automatic coupon status updates via cron jobs
- **Email Notifications** - Transactional emails for various events
- **PDF Generation** - Order invoices and reports
- **QR Code** - QR codes for products and orders

## 🔒 Security

- Password hashing with bcrypt
- JWT-based authentication
- OAuth 2.0 integration with Google
- Input validation for all routes
- Protected routes with role-based access control
- CORS protection
- Environment variable management

## 🚀 Deployment

The project includes a `vercel.json` configuration file for easy deployment on Vercel.

## ⚖️ License

This project is licensed under the ISC License.

## 👨‍💻 Author

Karma E-Commerce Team
