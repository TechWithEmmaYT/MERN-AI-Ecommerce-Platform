# Backend Guidelines

## Stack

TypeScript, Express 5, Mongoose 9, Passport JWT, Zod 4, bcryptjs, Stripe, Cloudinary, `ai` (Vercel AI SDK).

## Project Structure

```
backend/src/
  index.ts              # Express app entry
  config/               # env, database, passport, http-status, stripe, cloudinary
  constants/            # enums (roles, payment, order status) + constant (business values)
  controllers/          # HTTP concerns only
  services/             # Business logic only
  models/               # Mongoose schemas
  routes/               # Express routers (including webhook route with raw body)
  middlewares/          # asyncHandler, errorHandler, role
  validators/           # Zod schemas
  utils/                # app-error, bcrypt, cookie, get-env, helper
  types/                # Express module augmentation
  lib/                  # AI prompts
  webhooks/             # Stripe webhook handler
  seed/                 # Database seeders
```

## Architecture Pattern

Routes → Controllers → Services → Models. Routes define endpoints. Controllers handle HTTP concerns (parse request, call service, return response). Services contain all business logic. Models define Mongoose schemas.

#####

## File Naming

```
*.route.ts        # Routes
*.controller.ts   # Controllers
*.service.ts      # Services
*.model.ts        # Models
*.validator.ts    # Zod validators
*.middleware.ts   # Middleware
*.config.ts       # Configuration
*.webhook.ts      # Webhook handlers
*.seed.ts         # Seeders
```

## Models Pattern

All models use `timestamps: true`. User model strips `password` in `toJSON` transform. Use `slugify` in pre-validate/pre-save hooks for auto-generating slugs from names. Use `.lean()` on all read queries for performance.

### User Model

```typescript
import mongoose, { Document, Schema } from "mongoose";
import { compareHashPassword, hashPassword } from "../utils/bcrypt";
import { USER_ROLES, USER_ROLE_VALUES, type UserRole } from "../constants/enums";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(value: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.USER,
    },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        if (ret) {
          delete (ret as any).password;
        }
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareHashPassword(val, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
```

### Product Model

Categories are separate collection, referenced via `categoryId: Schema.Types.ObjectId`. Contains `calculateSalePrice` from utils. Auto-generates slug from name via `syncFields` helper.

Important: `syncFields` helper runs in both pre-validate and pre-save hooks. The `salePrice` is calculated via `calculateSalePrice(originalPrice, discountPercent)` using `Math.round` cent arithmetic.

Fields: `userId`, `categoryId`, `name`, `slug`, `description`, `images: string[]`, `originalPrice`, `salePrice`, `discountPercent`, `discountLabel`, `unit` (default "piece"), `stockCount`, `ratingAverage`, `reviewCount`, `isActive`.

### Cart Model

Supports both authenticated (userId) and guest (guestCartId) users. Both fields are optional (required: false, default: null) with indexes.

```typescript
export interface CartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface CartDocument extends Document {
  guestCartId?: string | null;
  userId?: mongoose.Types.ObjectId | null;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Model

Contains: userId index, orderNo (auto-generated via `generateOrderNumber()` — random 5-byte hex uppercase), items array (with productId, name, image, originalPrice, discountPercent, salePrice, quantity, isReviewed), shippingAddress snapshot (recipientName, phone, street, city, state, postalCode, country, latitude, longitude), paymentMethod (enum), paymentStatus (enum), status (enum, indexed), statusHistory array (with status, note, createdAt; `_id: false`), subtotal/deliveryFee/tax/total, stripeCheckoutSessionId.

Status history default is `[{ status: ORDER_STATUS.PLACED, note: "Order has been placed", createdAt: new Date() }]`.

Items subdocument has `isReviewed: { type: Boolean, default: false }`.

### Category Model

Uses `slugify` in pre-validate and pre-save hooks (only when name is modified and non-empty). Fields: name, slug (unique, lowercase, trim), imageUrl, description, isActive, timestamps.

### RatingReview Model

One review per order item (`orderItemId: unique: true`). Fields: userId, orderId, orderItemId, productId, rating (1-5), comment.

### Address Model

Fields: userId, recipientName (trim, not required), phone (required, trim), street (required, trim), city (required, trim), state (required, trim), postalCode (required, trim), country (required, trim), latitude, longitude, isDefault. Default address logic handled in service (not model).

## Enums Pattern (constants/enums.ts)

```typescript
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export const USER_ROLE_VALUES = Object.values(USER_ROLES);
```

Also defines: PAYMENT_METHODS, PAYMENT_STATUS, ORDER_STATUS with same pattern.

## Business Constants (constants/constant.ts)

```typescript
export const FREE_DELIVERY_THRESHOLD = 20;
export const DELIVERY_FEE = 4.99;
export const TAX_RATE = 0.08;
```

## Auth Pattern

Uses Passport JWT with cookie extractor (reads `instant_access_token` from httpOnly cookies), not Authorization headers.

### Passport Config

- JwtStrategy with `passport-jwt`
- Cookie extractor: `req?.cookies?.instant_access_token ?? null`
- Audience: `["user"]`
- Calls `findUserById` to resolve user

### JWT Cookie Utilities (utils/cookie.ts)

```typescript
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const GUEST_CART_EXPIRY_DAYS = 14 * 24 * 60 * 60 * 1000;

export function setJwtAuthCookie({res, userId}: {res: Response; userId: string}) {
  const payload = { userId };
  const token = jwt.sign(payload, envConfig.JWT_SECRET, {
    audience: ["user"],
    expiresIn: envConfig.JWT_EXPIRES_IN as Time
  });
  return res.cookie("instant_access_token", token, {
    maxAge: SEVEN_DAYS,
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
  });
}

export function clearJwtAuthCookie(res: Response) {
  return res.clearCookie("instant_access_token", {path: "/"});
}

export function setGuestCartCookie(res: Response, guestCartId: string) {
  return res.cookie("instant_guest_cart_id", guestCartId, {
    maxAge: GUEST_CART_EXPIRY_DAYS,
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
  });
}

export function clearGuestCartCookie(res: Response) {
  return res.clearCookie("instant_guest_cart_id", {path: "/"});
}
```

### Guest Cart Merge (in cart.service.ts)

`mergeGuestCartService(guestCartId, userId)`: Finds guest cart. If no user cart exists, reassigns guest cart to user (sets userId, unsets guestCartId). If user cart exists, merges items by productId (adds quantities for duplicates, pushes new items), saves, then deletes guest cart.

### optionalCartAuth Middleware (in passport.config.ts)

If no `instant_access_token` cookie: sets `req.guestCartId` from existing or generated UUID guest cart, sets guest cart cookie. If token exists: authenticates via Passport, if auth succeeds sets req.user, if fails sets guest cart. Always calls next().

## Cookie Patterns

- `instant_access_token`: httpOnly, 7 days, secure in prod, sameSite strict/lax
- `instant_guest_cart_id`: httpOnly, 14 days, secure in prod, sameSite strict/lax
- Guest cart cookie set in `optionalCartAuth` when no cookie exists
- Guest cart ID format: `guest_${crypto.randomUUID()}`

### Auth Controller - Guest Cart Handling

Register and login controllers read `req.cookies?.instant_guest_cart_id ?? null` to get the guest cart ID. After successful auth, they call `clearGuestCartCookie(res)` if a guest cart existed, and `setJwtAuthCookie({ res, userId })` to establish the session.

Auth status uses a `toAuthUser()` helper that shapes the user response:
```typescript
const toAuthUser = (user: any) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  avatar: user.avatar ?? null,
  isAdmin: user.role === USER_ROLES.ADMIN,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
```

## Pricing Utility (utils/helper.ts)

Uses `Math.round` cent arithmetic to avoid floating point:

```typescript
export const calculateSalePrice = (
  originalPrice: number,    // Example: 19.99
  discountPercent: number,  // Example: 20
) => {
  if (discountPercent <= 0) return originalPrice;
  if (discountPercent >= 100) return 0;
  const originalPriceCents = Math.round(originalPrice * 100);
  const discountAmountCents = Math.round((originalPriceCents * discountPercent) / 100);
  const discountedPriceCents = originalPriceCents - discountAmountCents;
  return discountedPriceCents / 100; // Result: 15.99
};
```

Also: `generateGuestCartId` (UUID-based), `generateOrderNumber` (random 5-byte hex uppercase), `escapeRegex` (for regex-safe keyword search), `calculateCartTotals` (subtotal, delivery fee, tax, total with free delivery above $20 threshold).

```typescript
export const calculateCartTotals = (sum: number) => {
  const subtotal = Math.round(sum * 100) / 100;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const orderTotal = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
  return { subtotal, deliveryFee, tax, orderTotal };
};
```

## Validation Pattern (Zod)

```typescript
import { z } from "zod";

export const someSchema = z.object({
  field: z.string().trim().min(1),
  numField: z.coerce.number().int().min(0),
  optionalField: z.string().optional(),
  defaultField: z.coerce.boolean().optional().default(true),
});

export type SomeType = z.infer<typeof someSchema>;
```

Controllers call `schema.parse(req.body)` for body, `schema.parse(req.query)` for query, `schema.parse(req.params)` for params. Zod errors caught by global error handler.

## Controller Pattern

```typescript
import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http-status.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { someSchema } from "../validators/some.validator";
import { someService } from "../services/some.service";

export const someController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = someSchema.parse(req.body);
    const userId = req.user?._id;
    const result = await someService(userId, body);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Resource created successfully",
      ...result,
    });
  }
);
```

All controllers wrapped in `asyncHandler`. Use `HTTPSTATUS` constants. Return object format: `{ message: string, ...data }`.

## Service Pattern

Services take typed params, call models with `.lean()` for reads, `mongoose.startSession()` with `withTransaction()` for multi-document atomic ops. Throw `AppError` subclasses (BadRequestException, NotFoundException, etc.) for errors.

For reviews: uses `mongoose.startSession()` → `withTransaction()` to create review, update order item `isReviewed`, recompute product `ratingAverage` and `reviewCount` via aggregation, all atomically. Session ended after transaction.

Cart service returns `freeDeliveryThreshold` in all responses alongside the calculated totals.

Product service `getDealsService` returns array directly (not wrapped in object). `getProductsService` supports `skip` param for offset-based pagination alongside `page`/`limit`.

Admin order status update service (`updateOrderStatusAdminService`) has smart history pruning — if the status being set already exists in history, it truncates history to that point instead of pushing a duplicate. Also auto-sets `paymentStatus` to `PAID` when status becomes `DELIVERED`.

## Route Pattern

```typescript
import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { requireAdmin } from "../middlewares/role.middleware";
import { someController } from "../controllers/some.controller";

const someRoute = Router()
  .post("/create", passportAuthenticateJwt, requireAdmin, someController)
  .get("/", someController);

export default someRoute;
```

For routes where all endpoints share the same middleware (e.g., admin routes), use `router.use()` at the top:

```typescript
const adminRoute = Router();
adminRoute.use(passportAuthenticateJwt, requireAdmin);
adminRoute.get("/analytics", getAdminAnalyticsController);
adminRoute.get("/orders", getAdminOrdersController);
adminRoute.put("/orders/:orderId/status", updateOrderStatusController);
adminRoute.get("/products", getAdminProductsController);
adminRoute.post("/products", createProductController);
```

Routes index (routes/index.ts):

```typescript
const router = Router();
router.use("/auth", authRoute);
router.use("/categories", categoryRoute);
router.use("/cart", cartRoute);
router.use("/products", productRoute);
router.use("/reviews", reviewRoute);
router.use("/address", addressRoute);
router.use("/orders", orderRoute);
router.use("/admin", adminRoute);
export default router;
```

Webhook route uses `express.raw()` for raw body parsing and is mounted before `express.json()` in the entry point:

```typescript
app.use("/api/webhook", webhookRoutes); // BEFORE express.json()
app.use(express.json({ limit: "10mb" }));
```

## App Errors (utils/app-error.ts)

```typescript
export const ErrorCodes = {
  ERR_INTERNAL: "ERR_INTERNAL",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
  ERR_FORBIDDEN: "ERR_FORBIDDEN",
  ERR_NOT_FOUND: "ERR_NOT_FOUND",
  ERR_VALIDATION: "ERR_VALIDATION"
} as const;

export type ErrorCodeType = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class AppError extends Error {
  public statusCode: number;
  public errorCode: ErrorCodeType;
  constructor(message: string, statusCode: number, errorCode: ErrorCodeType) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found") {
    super(message, HTTPSTATUS.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}
```

Also: BadRequestException, UnauthorizedException, ForbiddenException, InternalServerException.

## Error Handler (middlewares/errorHandler.middleware.ts)

Handles ZodError (formats issues by path), AppError (uses statusCode/errorCode), and fallback Internal Server Error.

## Express Types Augmentation (types/express.d.ts)

```typescript
declare global {
  namespace Express {
    interface User extends UserDocument { _id?: any; }
    interface Request { guestCartId?: string | null; }
  }
}
```

## Config Files

- `env.config.ts`: Reads from env with defaults, uses `getEnv` util
- `database.config.ts`: Connects Mongoose, exits on failure
- `passport.config.ts`: JWT strategy + cookie extractor + optionalCartAuth middleware
- `http-status.config.ts`: HTTP status code constants
- `stripe.config.ts`: Initializes Stripe client with secret key and API version `2026-02-25.clover`
- `cloudinary.config.ts`: Initializes Cloudinary v2 SDK with cloud name, API key, and secret

## Webhooks (webhooks/stripe.webhook.ts)

Stripe webhook handler verifies `stripe-signature`, handles `checkout.session.completed` (marks order paid/confirmed, clears cart) and `checkout.session.expired` (marks order cancelled/failed).

## Entry Point Pattern (index.ts)

- Loads dotenv, sets up Express
- Mounts Stripe webhook route with raw body BEFORE `express.json()`
- `express.json({ limit: "10mb" })`, cookie-parser, urlencoded
- CORS with FRONTEND_ORIGIN, credentials: true
- Passport initialize
- Health check at `/health`
- Routes at `/api`
- Production: serves `client/dist`, SPA fallback for non-API routes
- Error handler last
- Connects database on listen

## Build Configuration

- tsup bundles src/index.ts → dist/ (CommonJS)
- tsconfig targets ES2021, module commonjs, strict mode
- nodemon for dev, copies package.json to dist

## Dependencies

Production: express (5.x), mongoose, passport, passport-jwt, jsonwebtoken, bcryptjs, zod, cors, cookie-parser, dotenv, helmet, slugify, ai, stripe, cloudinary

Dev: @types/* packages, nodemon, ts-node, tsup, typescript