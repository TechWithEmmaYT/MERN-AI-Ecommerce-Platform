# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# Social Oauth
- When adding a social OAuth integration (e.g., GitHub, Google), follow this structure: 1) Create `src/lib/social-oauth/` with encryption (AES-256-GCM), state (HMAC-signed CSRF), and an index.ts with OAuth URLs/token exchange/refresh/user API helpers, 2) Create `src/models/{provider}-account.model.ts`, 3) Create `src/services/{provider}.service.ts` with connect/callback/getAccessToken/disconnect, 4) Create `src/controllers/{provider}.controller.ts` with Zod validation, 5) Create `src/routes/{provider}.route.ts`, 6) Update env.config.ts, routes/index.ts, and .env/.env.example. Confidence: 0.70

# Resource Scaffolding
- When scaffolding a new resource (e.g., session, product, blog), follow this pattern: 1) Controllers use `asyncHandler` wrapper, and protected routes extract `_id` from `req.user`, 2) Validation schemas go in `src/validators/`, 3) Services export scaffolded function stubs that return placeholder text responses, 4) Routes use `passportAuthenticateJwt` middleware for protected endpoints. Confidence: 0.70
- Controllers must include a `message` field in every JSON response (e.g., `{ message: "Sessions retrieved successfully", sessions }`), not just return data without a message. Follow the existing pattern from auth and github controllers. Confidence: 0.65

# MongoDB
- Use `session.withTransaction()` instead of `startTransaction()`/`commitTransaction()`/`abortTransaction()` for cleaner code. `withTransaction()` auto-commits on success and auto-aborts on error, eliminating manual session management. Confidence: 0.70

# TestSprite Testing
- When generating TestSprite tests, always fetch real data (product IDs, user credentials, etc.) from the API first via HTTP calls — never use placeholder/hardcoded IDs like "prod-001" or "sample-product-1". Placeholder IDs won't match valid MongoDB ObjectIds and will cause false failures. Confidence: 0.85
- Always include concrete request payload examples and actual response schemas (with real field names, types, and values) in the code_summary.yaml fed to TestSprite. Without accurate payload/response shapes, TestSprite generates tests with wrong assertions (e.g., wrong status codes, missing fields, incorrect types) that fail on the test logic itself, not the API. Confidence: 0.85
- Before running TestSprite tests, manually set up the prerequisite state that tests need: register a fresh user, log in to get cookies/credentials, add items to cart, create addresses — then feed those real credentials, cookies, and IDs to TestSprite. TestSprite cannot orchestrate multi-step setup flows itself and will use hardcoded/fake values that fail. Confidence: 0.80

# node.js-scaffolding
See [node.js-scaffolding/taste.md](node.js-scaffolding/taste.md)
