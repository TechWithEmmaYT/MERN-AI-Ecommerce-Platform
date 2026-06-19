# Memory

## Project Overview
A full-stack e-commerce platform. See @README.md for setup and @backend/package.json for available scripts.

## Tech Stack
- Backend: Node.js, Express 5, TypeScript, MongoDB + Mongoose, Passport JWT (cookie-based), Zod validation, Stripe payments, Cloudinary images
- Frontend: React, Zustand (with persist), React Query, Tailwind

## Code Style Guidelines
- Use descriptive variable names
- Follow existing patterns in the codebase exactly — do not invent new patterns
- Extract complex conditions into meaningful boolean variables
- Keep services as plain async functions, no classes
- Controllers must always be wrapped in asyncHandler
- Always use HTTPSTATUS constants, never raw status codes
- Throw AppError subclasses (BadRequestException, NotFoundException, etc.) in services, never return error objects
- Validate all request bodies/queries with Zod before calling services
- Prefer .lean() for read-only Mongoose queries
- No try/catch in controllers — asyncHandler already handles it

## Architecture Notes
- Auth: JWT stored in httpOnly cookie `instant_access_token`, not Authorization header
- Cart: supports both guest (`instant_guest_cart_id` cookie) and authenticated users; guest cart merges into user cart on login/register
- Cart and order totals (subtotal, tax, delivery fee, total) are ALWAYS calculated server-side from DB product prices, never trusted from client
- Stock is deducted on order creation for cash on delivery, or on Stripe webhook confirmation for card payments
- Reviews require an order item to be delivered and purchased by the reviewing user; one review per order item enforced by unique index
- Admin routes require JWT + role: "admin"

## Common Workflows
- Building a new resource: use /resource, /controller, /service, /route custom commands (see .commandcode/commands/)
- Testing APIs: use TestSprite MCP, scope tests to only the feature just built
- Cart sync: client uses optimistic updates with debounced (500ms) sync to server, with rollback on failure

## MUST READ
