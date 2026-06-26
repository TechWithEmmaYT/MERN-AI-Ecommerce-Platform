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

  const setCookie = res.headers.get("set-cookie") || "";
  const body: Record<string, unknown> | null = await res.json().catch(() => null);
  return { status: res.status, body, setCookie };
}

async function registerFreshUser(): Promise<string> {
  registeredEmail = uniqueEmail();
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Logout Test User", email: registeredEmail, password: registeredPassword }),
    redirect: "manual",
  });
  if (res.status !== 201) {
    throw new Error(`setup: failed to register user, got ${res.status}`);
  }
  const cookie = res.headers.get("set-cookie") || "";
  return cookie.split(";")[0];
}

async function testLogoutAuthenticated(): Promise<void> {
  const cookie = await registerFreshUser();
  const { status, body, setCookie } = await request("POST", "/auth/logout", { cookie });

  if (status !== 200) throw new Error(`authenticated: expected 200, got ${status}`);
  if (body?.message !== "User logged out successfully")
    throw new Error(`authenticated: wrong message: ${body?.message}`);
  if (!setCookie.includes("instant_access_token=;") && !setCookie.includes("instant_access_token="))
    throw new Error("authenticated: cookie not cleared");
}

async function testLogoutWithoutCookie(): Promise<void> {
  const { status, body } = await request("POST", "/auth/logout");

  if (status !== 200) throw new Error(`no cookie: expected 200, got ${status}`);
  if (body?.message !== "User logged out successfully")
    throw new Error(`no cookie: wrong message: ${body?.message}`);
}

async function testStatusAfterLogout(): Promise<void> {
  const cookie = await registerFreshUser();
  await request("POST", "/auth/logout", { cookie });

  const { status } = await request("GET", "/auth/status", { cookie });
  if (status !== 401) throw new Error(`status after logout: expected 401, got ${status}`);
}

async function main(): Promise<void> {
  const tests: (() => Promise<void>)[] = [
    testLogoutAuthenticated,
    testLogoutWithoutCookie,
    testStatusAfterLogout,
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
