const BASE = "https://instant-cart.onrender.com/api";

function uniqueEmail(): string {
  return `testuser${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
}

let registeredEmail = "";
const registeredPassword = "Password123!";

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

  const body: Record<string, unknown> | null = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function registerFreshUser(): Promise<string> {
  registeredEmail = uniqueEmail();
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Status Test User", email: registeredEmail, password: registeredPassword }),
    redirect: "manual",
  });
  if (res.status !== 201) {
    throw new Error(`setup: failed to register user, got ${res.status}`);
  }
  const cookie = res.headers.get("set-cookie") || "";
  return cookie.split(";")[0];
}

async function testStatusAuthenticated(): Promise<void> {
  const cookie = await registerFreshUser();
  const { status, body } = await request("GET", "/auth/status", { cookie });

  if (status !== 200) throw new Error(`authenticated: expected 200, got ${status}`);
  if (body?.message !== "User is authenticated")
    throw new Error(`authenticated: wrong message: ${body?.message}`);
  if ((body?.user as Record<string, unknown>)?.email !== registeredEmail)
    throw new Error(`authenticated: wrong email`);
  if (!(body?.user as Record<string, unknown>)?._id) throw new Error("authenticated: missing _id");
}

async function testStatusNoCookie(): Promise<void> {
  const { status } = await request("GET", "/auth/status");
  if (status !== 401) throw new Error(`no cookie: expected 401, got ${status}`);
}

async function testStatusMalformedToken(): Promise<void> {
  const { status } = await request("GET", "/auth/status", {
    cookie: "instant_access_token=invalidtoken123",
  });
  if (status !== 401) throw new Error(`malformed token: expected 401, got ${status}`);
}

async function main(): Promise<void> {
  const tests: (() => Promise<void>)[] = [
    testStatusAuthenticated,
    testStatusNoCookie,
    testStatusMalformedToken,
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
