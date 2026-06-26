const BASE = "https://instant-cart.onrender.com/api";

function uniqueEmail(): string {
  return `testuser${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
}

let registeredEmail = "";
let registeredPassword = "Password123!";

async function request(
  method: string,
  path: string,
  opts: { body?: Record<string, unknown>; cookie?: string } = {},
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.cookie) headers["cookie"] = opts.cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    redirect: "manual",
  });

  const setCookie = res.headers.get("set-cookie") || "";
  const body: Record<string, unknown> | null = await res.json().catch(() => null);
  return { status: res.status, body, setCookie };
}

async function registerFreshUser(): Promise<void> {
  registeredEmail = uniqueEmail();
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Login Test User", email: registeredEmail, password: registeredPassword }),
    redirect: "manual",
  });
  if (res.status !== 201) {
    throw new Error(`setup: failed to register user, got ${res.status}`);
  }
}

async function testLoginHappyPath(): Promise<void> {
  const { status, body, setCookie } = await request("POST", "/auth/login", {
    body: { email: registeredEmail, password: registeredPassword },
  });

  if (status !== 200) throw new Error(`login happy path: expected 200, got ${status}`);
  if (body?.message !== "User logged in successfully")
    throw new Error(`login happy path: wrong message: ${body?.message}`);
  if ((body?.user as Record<string, unknown>)?.email !== registeredEmail)
    throw new Error(`login happy path: wrong email`);
  if (!(body?.user as Record<string, unknown>)?._id) throw new Error("login happy path: missing _id");
  if (!setCookie.includes("instant_access_token"))
    throw new Error("login happy path: missing instant_access_token cookie");
}

async function testLoginWrongPassword(): Promise<void> {
  const { status } = await request("POST", "/auth/login", {
    body: { email: registeredEmail, password: "wrongpassword" },
  });
  if (status !== 401) throw new Error(`wrong password: expected 401, got ${status}`);
}

async function testLoginNonExistentEmail(): Promise<void> {
  const { status } = await request("POST", "/auth/login", {
    body: { email: "nonexistent@example.com", password: "Password123!" },
  });
  if (status !== 401) throw new Error(`non-existent email: expected 401, got ${status}`);
}

async function testLoginMissingPassword(): Promise<void> {
  const { status } = await request("POST", "/auth/login", {
    body: { email: registeredEmail },
  });
  if (status !== 400) throw new Error(`missing password: expected 400, got ${status}`);
}

async function testLoginEmptyBody(): Promise<void> {
  const { status } = await request("POST", "/auth/login", { body: {} });
  if (status !== 400) throw new Error(`empty body: expected 400, got ${status}`);
}

async function main(): Promise<void> {
  // Register a fresh user so the happy-path test has known-good credentials
  await registerFreshUser();

  const tests: (() => Promise<void>)[] = [
    testLoginHappyPath,
    testLoginWrongPassword,
    testLoginNonExistentEmail,
    testLoginMissingPassword,
    testLoginEmptyBody,
  ];

  let failures = 0;
  for (const test of tests) {
    try {
      await test();
    } catch (err) {
      failures++;
      process.stderr.write(`${test.name}: ${(err as Error).message}\n`);
    }
  }

  process.exit(failures > 0 ? 1 : 0);
}

main();
export {};
