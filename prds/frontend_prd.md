# Instant E-Commerce Frontend — TestSprite Web Test PRD

## App Overview
A grocery e-commerce SPA built with Vite + React 19 + TypeScript. Users browse products, manage a cart (guest or logged-in), place orders, track them, and leave reviews. Admins manage products, orders, and see analytics.

## Tech Stack
- **Build**: Vite + React 19 + TypeScript
- **Routing**: React Router v7 (createBrowserRouter)
- **Server State**: TanStack Query (@tanstack/react-query)
- **Client State**: Zustand with persist middleware (cart, auth dialog)
- **UI**: shadcn/ui + Tailwind CSS v4 + Radix UI primitives
- **Forms**: react-hook-form + zod
- **HTTP**: Axios (baseURL: https://instant-cart.onrender.com/api/, withCredentials: true for cookies)
- **Notifications**: sonner
- **Carousel**: embla-carousel-react
- **Dialog**: @radix-ui/react-dialog (auth modal)

## Test Credentials
- **Admin user**: email: john@gmail.com, password: password123
- **Non-admin user**: email: john@gmail.com, password: password123

## Running App
- Frontend dev server: `https://instant-cart.onrender.com`
- Backend API: `https://instant-cart.onrender.com/api/`

---

## AUTH FLOW

### Auth Dialog (Modal)
- Located in `src/components/auth-dialog.tsx`
- A shadcn `Dialog` (modal) that overlays the **current page** without navigating away
- Controlled by Zustand store `useAuth`: `isAuthOpen`, `view` ("login" | "register")
- Opened via:
  - Clicking "Sign in" in the nav
  - Clicking "Checkout" in the cart sheet when logged out
  - Guard redirect on protected routes
- **Two tabs inside the dialog**: "Login" and "Register"
- Both forms use `react-hook-form` with `zod` validation

### Login Form
- Fields: email, password
- Submission: `loginMutationFn` (POST `/auth/login`)
- On success:
  1. `["current-user"]` TanStack Query is invalidated → user state refreshes
  2. `fetchCart()` syncs server cart (guest cart merges on backend)
  3. A success toast appears
  4. Dialog closes

### Registration Form
- Fields: name, email, password
- Submission: `registerMutationFn` (POST `/auth/register`)
- Same success flow as login

### Logout
- Click "Log out" in the user avatar dropdown (nav) or admin sidebar footer
- Calls `logoutMutationFn` (POST `/auth/logout`)
- Clears TanStack Query cache for `["current-user"]`
- Resets Zustand cart to empty
- Redirects to `/`

### Auth State in Nav (`src/components/nav.tsx`)
- **Logged out**: Shows "Welcome / Sign in" text → clicking opens auth dialog
- **Logged in**: Shows user avatar (initials circle) → dropdown with:
  - Order history (-> `/orders`)
  - My Addresses (-> `/account/addresses`)
  - My Reviews (-> `/account/reviews`)
  - Admin Portal (-> `/admin`, only if `user.role === "admin"`)
  - Logout

---

## ROUTE STRUCTURE

### Public (no auth required)
| Path | Page | Description |
|---|---|---|
| `/` | `HomePage` | Hero carousel, category carousel, deals grid, more products |
| `/products` | `ProductsPage` | Category filter sidebar, product grid, sort & price filters |
| `/products/:slug` | `ProductDetailPage` | Product info, image, cart card, reviews, related products |
| `/search-results` | `SearchResultPage` | Search via `?q=` param, product grid with sort |

### Protected (auth required)
| Path | Page | Layout |
|---|---|---|
| `/checkout` | `CheckoutPage` | No account layout (standalone) |
| `/orders` | `OrdersPage` | AccountLayout (sidebar) |
| `/orders/:orderId` | `OrderTrackingPage` | AccountLayout (sidebar) |
| `/account/reviews` | `AccountReviewsPage` | AccountLayout (sidebar) |
| `/account/addresses` | `AccountAddressesPage` | AccountLayout (sidebar) |

### Admin (auth + admin role required)
| Path | Page | Layout |
|---|---|---|
| `/admin` | `AdminDashboardPage` | AdminLayout (sidebar) |
| `/admin/orders` | `AdminOrdersPage` | AdminLayout (sidebar) |
| `/admin/products` | `AdminProductsPage` | AdminLayout (sidebar) |
| `/admin/products/new` | `AdminNewProductPage` | AdminLayout (sidebar) |

---

## LAYOUTS

### AppLayout
Wraps all non-admin routes. Components from top to bottom:
1. **Banner** (`src/components/banner.tsx`) — Top promo banner ("Free delivery over $20")
2. **Nav** (`src/components/nav.tsx`) — Logo, search bar, category dropdown, cart button, auth
3. **`<main>`** with `<Outlet />`
4. **Footer** (`src/components/footer.tsx`)
5. **CartSheet** (`src/components/cart-sheet.tsx`) — Slide-out cart from right
6. **AuthDialog** — Modal for login/register

### AccountLayout
Used for user account pages. Two-column layout:
- **Left** (260px): Sidebar nav with links to Order history, My Reviews, Addresses + "Back" button + Logout
- **Right**: Outlet content

### AdminLayout
Used for all `/admin/*` routes. shadcn `SidebarProvider`:
- **Left**: Collapsible sidebar with logo, nav (Dashboard, Orders, Products), footer (Storefront, Logout)
- **Top**: Header bar with user name/email + sidebar toggle
- **Content**: `<Outlet />`
- Redirects non-admin users to `/`

---

## HOME PAGE

### Hero Carousel (`src/components/home/hero-carousel.tsx`)
- Embla carousel with **3 hero slides** (promotional banners with images, headings, descriptions, CTA buttons)
- Auto-plays, can be paused, has dot indicators
- First slide CTA links to `/products`
- Second slide CTA links to `/products?category=Beverages`
- Third slide CTA links to `/products`

### Categories Section (`src/components/home/categories-section.tsx`)
- Fetches `["categories"]` via `getAllCategoriesQueryFn` (GET `/categories`)
- Horizontal carousel of category cards with:
  - Background image (from `category.imageUrl`)
  - Category name overlay
  - Links to `/products?categoryId={id}`
- Shows 6 items at a time with scroll arrows

### Deals Section (`src/components/home/deals-section.tsx`)
- Fetches `["product-deals", 6]` via `getProductDealsQueryFn(6)` (GET `/products/deals?limit=6`)
- Section title: "Today's Hot Deals"
- Grid of 3-6 product cards with:
  - Image, name, sale price, original price (strikethrough), discount badge
  - "Add to cart" button
  - Links to product detail on click

### More Products Section (`src/components/home/product-sections.tsx`)
- Fetches `["more-products", 12]` via `getProductsQueryFn({ limit: 12 })` (GET `/products?limit=12`)
- Section title: "More Products"
- Grid of product cards with same layout as deals

---

## PRODUCTS PAGE (`/products`)

### Layout
Two-column: sidebar filters (left, ~280px) + product grid (right)

### Sidebar Filters
- **Category list**: Fetched from `["categories"]` query
  - "All" (no filter) + each category card with icon/image + count
  - Clicking a category adds `?categoryId=` to URL via `useSearchParams`
- **Checkboxes**: "Deals only" (`hasDiscount=true`), "In stock" (`inStock=true`)
- **Price Range**: Min price / Max price inputs
- "Clear all" link to reset filters

### Product Grid
- Renders product cards in responsive grid (2 cols mobile → 4 cols desktop)
- Each card: Image, name, price, add to cart
- **Sort dropdown** above grid: `best-match`, `price-low`, `price-high`, `highest-rating`
  - Default: "best-match"
  - Passed as `sort` param to GET `/products`

### Empty State
- Shows illustration + "No products found" + "Try adjusting your filters" message
- "Clear filters" button

---

## PRODUCT DETAIL (`/products/:slug`)

### Layout
3-column: image (left) + details (center) + cart card (right)

### Product Image
- Main image with thumbnail gallery below (up to 4 images)

### Product Details
- Category breadcrumb
- Name
- Star rating display (filled/half/empty stars) + review count
- Price display:
  - If discounted: originalPrice (strikethrough) + salePrice + discount badge
  - If not discounted: single price
- Description text
- Unit text (e.g., "1 kg", "16 oz")

### Cart Card (sticky sidebar card)
- **If NOT in cart**: Quantity selector (1-99) + "Add to cart" button
- **If in cart**: Shows quantity (already X in cart) with +/- inline controls
- **Out of stock**: Shows "Out of stock" message, button disabled

### Reviews Section (below product details)
- **Rating Breakdown** (`src/components/product/rating-breakdown.tsx`): Star distribution bars (5 stars → 1 star) with counts and percentages
- **Reviews list**: User avatar, name, rating stars, comment text, date
- **Paginated**: "Show more" or page controls

### Related Products
- Fetches `["related-products", slug]` — GET `/products/:slug` with `relatedProducts` in response
- Horizontal scroll row or grid of 4-6 product cards
- Same card style as main product grid

---

## SEARCH RESULTS (`/search-results`)

### Query Parameter
- Reads `?q=` from URL search params
- No query → shows empty state with message "Search for products"

### Results
- Fetches `["search-products", q, sort]` via `getProductsQueryFn({ keyword: q, sort })`
- Product grid with sort dropdown
- "No results" state with illustration when empty
- Skeleton loading cards while fetching

---

## CART SYSTEM

### Cart Button (Nav)
- Shopping cart icon with badge showing item count
- On click: opens `CartSheet` (slide-out from right)

### CartSheet (`src/components/cart-sheet.tsx`)
- **Slide-out** from right side (shadcn `Sheet`)
- **Sections**:
  - Header: "Cart" + item count + close button
  - **Items list**: Each item has:
    - Product image (thumbnail)
    - Name, unit info
    - Price (salePrice × quantity)
    - Quantity controls (+/-) with minimum 1, maximum from stock
    - Remove button (trash icon)
  - **Free delivery banner**: "Add ${remaining} more for FREE delivery" when subtotal < $20
  - **Pricing summary**: Subtotal → Delivery fee → Tax → Order total
  - **Footer**: "Go to Checkout" button
    - Logged out: Opens auth dialog
    - Logged in: Navigates to `/checkout`

### Guest Cart
- Items stored in **localStorage** via Zustand persist (key: `"instant-cart"`)
- Fully functional without login
- On login: guest cart merges into server cart (handled by backend)

### Authenticated Cart Sync
1. **On login**: `fetchCart()` called → GET `/cart`
2. **On any change** (add, update qty, remove):
   - Optimistic local update immediately
   - Debounced (500ms) sync via `updateCartMutationFn` (POST `/cart`)
   - On success: server returns updated totals → store updates
   - On error: rollback to snapshot, show error toast
3. **Stock validation**: `checkStock(productId, quantity)` prevents exceeding available stock

---

## CHECKOUT FLOW (`/checkout`)

### Guard
- Protected route: if not logged in, redirects to home and opens auth dialog
- If cart is empty: shows "Your cart is empty" with link to `/products`

### Layout
Two-column: accordion panels (left) + order summary sidebar (right, sticky)

### Step 1: Delivery Address
- **Address list**: Radio cards showing saved addresses (fetched via `["addresses"]` query)
- **Auto-selection**: `isDefault` address is pre-selected
- **"Add new address" button**: Opens a dialog with form:
  - Fields: recipientName, phone, street, city, state, postalCode, country
  - Validation: `zod` schema (all required except country has default)
  - Submit: `createAddressMutationFn` → adds to list, auto-selects
- **Selection**: Radio button → address is selected → auto-advances to Step 2

### Step 2: Payment Method
- Two radio options in card layout:
  - **Card / Debit card** (value: `"card"`): Shows "Powered by Stripe" badge, info text
  - **Cash on delivery** (value: `"cash_on_delivery"`): Shows "Pay when you receive" text
- Disabled until an address is selected
- Selection → auto-advances to Step 3

### Step 3: Review & Confirm
- **Order summary**: Cart items with names, quantities, prices
- **Delivery address**: Shows selected address as read-only card
- **Payment method**: Shows selected method
- **Button**:
  - Card: "Continue to checkout" → redirects to Stripe Checkout URL
  - COD: "Place order" → creates order immediately
- On success:
  - Card: `window.location.href = stripeUrl` (redirect to Stripe)
  - COD: Navigate to `/orders/:orderId?success=true`, toast "Order placed successfully"
  - Cart resets

### Order Summary Sidebar
- Sticky, shows: Subtotal, Delivery fee (free if over $20), Tax (8%), **Order total**
- Same component used in CartSheet

---

## ORDER TRACKING (`/orders/:orderId`)

### Layout (AccountLayout sidebar)
- **Order header**: Order number (#XXXXX), status badge, date, "Copy order ID" button
- **Status stepper**: Horizontal progress bar with 5 steps:
  - Placed → Confirmed → Packed → Out for Delivery → Delivered
  - Current step is highlighted, completed steps are green, future steps are gray
  - Cancelled: Shows cancelled state with red styling
- **Items list**: Each item has image, name, quantity, price
- **Status history timeline**: All status changes with dates (read from `statusHistory`)
- **Delivery address card**: Shows full address
- **Payment summary**: Subtotal, delivery fee, tax, total — same format as cart
- **Payment status badge**: "Paid" or "Pending"

---

## ORDER HISTORY (`/orders`)

### Layout (AccountLayout sidebar)
- **Orders list**: Card for each order with:
  - First product thumbnail + name
  - Order number, item count
  - Status badge (color-coded)
  - Date
  - Total price
  - "View order" link → `/orders/:orderId`

---

## ACCOUNT ADDRESSES (`/account/addresses`)

### Layout (AccountLayout sidebar)
- **Address cards grid**: Each card shows recipient name, street, city, state, postalCode, country, phone
  - Default badge on `isDefault` address
- **"Add address" button**: Opens same address form dialog as checkout
- **Empty state**: "No addresses saved" message

---

## ACCOUNT REVIEWS (`/account/reviews`)

### Layout (AccountLayout sidebar)
- **Two tabs**: "To Review" (default) | "Reviewed"

### To Review Tab
- Fetches `["reviewable-items"]` via `getReviewableOrderItemsQueryFn` (GET `/reviews/reviewable`)
- Shows orders with items that are **delivered** but **not yet reviewed**
- Each item has:
  - Product image, name, quantity
  - Star rating selector (clickable 1-5 stars)
  - Comment textarea
  - "Submit review" button
  - Calls `createReviewMutationFn({ orderId, orderItemId, rating, comment })` → POST `/reviews`

### Reviewed Tab
- Fetches `["user-reviews"]` via `getUserReviewsQueryFn` (GET `/reviews`)
- Shows past reviews with product thumbnail, rating stars, comment, date

---

## ADMIN DASHBOARD (`/admin`)

### Layout (AdminLayout sidebar)
- **Header**: "Dashboard" + "Welcome back, view store analytics"
- **Stats grid**: 4 cards (2×2 or 4-col):
  - Total Revenue ($X.XX), Total Orders (X), Total Products (X), Out of Stock (X)
  - Each with icon and description
  - Fetched from GET `/admin/analytics`
- **Recent Orders table**: Last 7 orders with columns:
  - Order ID (#orderNo), Customer, Shipping To, Date, Total, Payment, Status
  - "View All Orders" button → `/admin/orders`

---

## ADMIN ORDERS (`/admin/orders`)

### Layout (AdminLayout sidebar)
- **Orders table**: Paginated (10 per page) with columns:
  - Order ID, Customer (name + phone), Shipping To (recipient, street, city/state/country), Date, Items (count), Total, Payment (badge), Status Update (dropdown)
- **Status update dropdown** per row:
  - Shows current status (color-coded) with dropdown arrow
  - Dropdown lists next available statuses (excludes already-used ones)
  - Disabled for "delivered" and "cancelled" orders
  - On change: calls `updateOrderStatusMutationFn` → PUT `/admin/orders/:id/status`
  - Success toast + invalidates queries
- **Pagination**: Backend-driven with prev/next, "Page X of Y (Z total orders)" text

---

## ADMIN PRODUCTS (`/admin/products`)

### Layout (AdminLayout sidebar)
- **Header**: Title + "New Product" button → `/admin/products/new`
- **Products table**: Paginated (10 per page) with columns:
  - Product (thumbnail + name + unit), Slug, Original Price, Discount(%), Sale Price, Stock Count, Status (In Stock / Out of Stock badge)
- **Pagination**: Same backend-driven pattern as orders

---

## ADMIN NEW PRODUCT (`/admin/products/new`)

### Layout (AdminLayout sidebar)
Full-page form with sections:

### Basic Info
- **Category**: Select dropdown, fetches `["categories"]`, shows category name + image
- **Product Name**: Text input
- **AI button** "Rephrase" → calls `generateProductAiMutationFn` with `action: "rephrase-title"`, fills name field with AI result
- **Description**: Textarea
- **AI button** "Generate" → calls `generateProductAiMutationFn` with `action: "generate-desc"`, fills description with AI result

### Image Uploader
- **Two input methods**:
  1. **Upload files**: Drag/click file input → sends via `uploadProductImagesMutationFn` (multipart POST `/admin/products/upload`) → returns URLs → shows image previews
  2. **Paste URL**: Text input for image URL → directly added
- **Previews**: Thumbnails with remove button (X)
- Max count: up to 10 images

### Pricing
- **Original Price**: Number input
- **Discount (%)**: Number input (0-100)
- **Discount Label**: Text input (e.g., "Limited Offer")
- **Sale Price**: Auto-calculated, read-only display (original × (1 - discount/100))

### Inventory & Status
- **Unit**: Text input (e.g., "1 kg", "16 oz", "pack")
- **Stock Count**: Number input (default 0)
- **Active**: Toggle switch (default on)

### Submit
- "Create Product" button
- Validation via `zod` schema
- Calls `createProductMutationFn` (POST `/admin/products`)
- On success: toast + redirect to `/admin/products`

---

## PAGINATION PATTERN (All Admin Tables)
Backend returns:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
UI shows: "Page X of Y (Z items)" + Previous/Next buttons (disabled when `hasPrevPage`/`hasNextPage` is false).

---

## SKELETON LOADING PATTERN
Admin pages use skeleton components that **mirror the final content layout**:
- Stat cards: Skeleton title, value, description shapes
- Table: Skeleton header rows + 5 skeleton body rows
- Never use a generic "loading spinner" for admin pages

---

## COMPONENT LOCATIONS (Key Files)

| File Path | Component |
|---|---|
| `src/components/auth-dialog.tsx` | Login/Register modal dialog |
| `src/components/nav.tsx` | Navigation bar with auth, cart, search |
| `src/components/cart-sheet.tsx` | Slide-out cart panel |
| `src/layouts/app-layout.tsx` | Main app layout (nav + footer) |
| `src/layouts/account-layout.tsx` | User account sidebar layout |
| `src/layouts/admin-layout.tsx` | Admin sidebar layout |
| `src/pages/home/index.tsx` | Home page with carousel, categories, deals |
| `src/pages/products/index.tsx` | Product listing with filters |
| `src/pages/product-detail/index.tsx` | Product detail + reviews |
| `src/pages/checkout/index.tsx` | Checkout flow |
| `src/pages/orders/orders.tsx` | Order history |
| `src/pages/orders/order-tracking.tsx` | Single order tracking |
| `src/pages/account/addresses.tsx` | Manage addresses |
| `src/pages/account/reviews.tsx` | Manage reviews |
| `src/pages/admin/dashboard.tsx` | Admin analytics dashboard |
| `src/pages/admin/orders.tsx` | Admin orders management |
| `src/pages/admin/products.tsx` | Admin products list |
| `src/pages/admin/new-product.tsx` | Admin create product form |
| `src/hooks/use-cart.ts` | Zustand cart store |
| `src/hooks/use-auth.ts` | Zustand auth dialog store |
| `src/lib/api.ts` | All API query/mutation functions |
| `src/lib/axios-client.ts` | Axios instance with credentials |
