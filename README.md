# Nexgensis Product Dashboard

A modern, high-performance B2B SaaS product management dashboard built with Next.js 16 (App Router), Tailwind CSS, and Axios, integrating with the DummyJSON API for product catalogue management, filtering, search, and authentication.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd nexgensis-product-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Build for Production:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Demo Credentials

To test authentication on the Login Page (`/login`):

- **Username**: `emilys`
- **Password**: `emilyspass`

*(A "Fill demo login" quick helper button is also available directly on the login card).*

---

## ✨ Features

- 🔒 **Authentication & Protected Routes**: JWT auth persistence via `localStorage`, automatic protected route guards, and clean logout.
- 📦 **Full CRUD Management**: Create new products, edit details, and delete items with interactive modal dialogs and device image uploads.
- 🔍 **Search & Category Filtering**: Debounced search with clear trigger, custom styled category select, and single-click reset.
- 🔃 **Sorting**: Flexible sorting by Price, Rating, and Title (Ascending & Descending) with active indicators.
- 📄 **Modern Pagination**: Sleek limit selection (10, 20, 50 per page), dynamic page numbers, and chevron navigation.
- 🌐 **URL Parameter Synchronization**: Search queries, selected category, sort key, current page, and page limit sync dynamically to URL query parameters (`?search=`, `?category=`, `?sortBy=`, `?order=`, `?page=`, `?limit=`).
- 📱 **Responsive Mobile Layout**: Fixed table column layout on desktop and adaptive card view on mobile screens.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Inter Typography, Custom Scrollbars
- **HTTP Client**: Axios with baseURL interceptor
- **Icons**: Inline SVG System (Heroicons inspired)

---

## 📐 Architecture & Project Structure

```
nexgensis-product-dashboard/
├── public/                     # Static assets (logo, favicon, illustration)
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css         # Global CSS & custom scrollbar utilities
│   │   ├── layout.js           # Root layout with ProductMutationProvider
│   │   ├── page.js             # Root redirect page (/ -> /products)
│   │   ├── login/
│   │   │   └── page.js         # Redesigned 2-column SaaS Login Page
│   │   └── products/
│   │       ├── page.js         # Main Product Dashboard (Table/Cards/Filters)
│   │       └── [id]/
│   │           └── page.js     # Product Details Page with Reviews & Edit/Delete
│   ├── components/
│   │   ├── Navbar.js           # Header with user avatar and brand logo
│   │   ├── FilterBar.js        # Search input, Category selector, Sort selector
│   │   ├── ProductTable.js     # Desktop fixed column layout table
│   │   ├── ProductCard.js      # Mobile responsive card grid view
│   │   ├── Pagination.js       # Modern pagination controls
│   │   ├── ProductFormModal.js # Add/Edit product modal with device image upload
│   │   └── ProductReviews.js   # Customer review cards and rating stars
│   ├── context/
│   │   └── ProductMutationContext.js # Client mutation overlay context
│   ├── hooks/
│   │   ├── useAuth.js          # Authentication state & login handler
│   │   ├── useProducts.js      # Product data fetching & URL state sync
│   │   └── useDebounce.js      # Search input debouncer
│   ├── services/
│   │   ├── api.service.js      # Base Axios instance
│   │   ├── auth.service.js     # Auth API service (DummyJSON login)
│   │   └── product.service.js  # Product API service (CRUD endpoints)
│   └── utils/
│       └── auth.utils.js       # JWT & localStorage helper functions
└── README.md
```

---

## ⚠️ Important API & Architecture Notes

### 1. Search & Category API Limitation
The DummyJSON API treats search (`/products/search?q=`) and category filtering (`/products/category/{slug}`) as two separate endpoints. DummyJSON does not natively support combining search queries and category filters in a single backend SQL request. The dashboard resolves this by managing client-side combining and filtering seamlessly.

### 2. DummyJSON Mutation Non-Persistence
DummyJSON returns a simulated HTTP `200/201 OK` payload for `POST` (create), `PUT` (update), and `DELETE` requests, but **does not persist** these mutations on its remote database server. Subsequent GET calls to `dummyjson.com/products` will return original mock data.

### 3. Client-Side Mutation Context Solution (`ProductMutationContext`)
To ensure a smooth, realistic SaaS user experience, the app uses a custom `ProductMutationContext`. Created items, edited product details, and deleted items are stored in client memory overlay state. The `useProducts` hook overlays local mutations on top of API GET responses so created/updated/deleted products remain consistent across page navigation, sorting, and pagination throughout the user session.

### 4. Race-Condition & Out-of-Order Request Handling
When typing fast in the search bar or rapidly switching categories, multiple asynchronous network requests may be triggered. The `useProducts` hook implements a request sequence tracking mechanism (using request IDs / cancellation tokens) to ensure out-of-order API responses are ignored and only the latest request updates the table state.

---

## 🤖 AI Assistance Note

This project was built and refined with the assistance of **Antigravity**, an AI agentic coding assistant by Google DeepMind. AI assistance was utilized for component refactoring, modern SaaS visual styling (custom scrollbars, responsive layouts, color systems), accessibility improvements, and documentation.

---

## 📄 License

MIT License. Developed for Nexgensis Dashboard Assignment.
