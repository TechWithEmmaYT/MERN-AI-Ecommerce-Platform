Create a new controller for "$1" following the EXACT patterns

Rules:
- Every function MUST be wrapped in asyncHandler
- Use HTTPSTATUS constants for all status codes, never raw numbers
- Validate req.body or req.query with the matching Zod schema before calling the service
- No try/catch — asyncHandler handles errors
- Return res.status(HTTPSTATUS.X).json({ message, ...data })

Generate: backend/src/controllers/$1.controller.ts