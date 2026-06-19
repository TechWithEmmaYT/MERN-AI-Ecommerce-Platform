# Instant E-Commerce Backend

## Product Overview
A full-stack grocery e-commerce REST API. Users can browse products by category, manage a cart as guest or authenticated user, save delivery addresses, place orders via card or cash on delivery, track order status, and leave reviews on delivered items. Admins manage products, view orders, and update order status.

## Core Goals
- Allow guests to shop without forcing signup, with cart persisting through login
- Provide a fast, reliable checkout flow with verified server-side pricing
- Support both online payment (Stripe) and cash on delivery
- Let customers review only items they've actually purchased and received
- Give admins visibility and control over orders and product catalog

## Key Features
- JWT cookie-based authentication with guest cart support
- Product catalog with category filtering, search, sorting, and pagination
- Cart that works for both guests and logged-in users, auto-merging on login
- Address book management for delivery
- Order creation with Stripe checkout or cash on delivery
- Stripe webhook for reliable payment confirmation
- Stock deduction on confirmed orders
- Review system restricted to delivered, purchased items
- Admin dashboard for managing products and order statuses

## User Flow Summary
- Guest browses products, adds items to cart (cart tied to a guest cookie)
- Guest proceeds to checkout, is prompted to log in or register
- On login/register, guest cart merges into the user's account cart
- User selects a delivery address, chooses payment method
- For card payment, user is redirected to Stripe and redirected back after payment
- For cash on delivery, order is placed immediately
- User can view order history and track order status
- Once an order is delivered, user can leave a review for purchased items
- Admin logs in, views all orders, updates order status, manages products

## Validation Criteria
- Cart and checkout totals (subtotal, tax, delivery fee, total) must always be calculated server-side from current product prices, never trusted from client input
- A review can only be created for an order item that belongs to the authenticated user and has been delivered
- A user cannot review the same order item twice
- Stock must never go negative; orders should fail gracefully if stock is insufficient
- Only users with admin role can access admin endpoints
- Guest and authenticated cart identities must never both exist on the same cart document

## Test Credentials
- User: email: techemma@gmail.com, password: 123456
- Admin: email: techemma@gmail.com, password: 123456

## Test Data
- Valid productId: (paste real one from your DB)
- Valid categoryId: (paste real one from your DB)