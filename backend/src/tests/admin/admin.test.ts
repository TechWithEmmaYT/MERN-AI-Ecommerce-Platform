const BASE = "https://instant-cart.onrender.com/api";

function uniqueEmail(): string {
  return `testadm${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function request(
  method: string,
  path: string,
  opts: { body?: Record<string, unknown>; cookie?: string } = {},
) {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers["cookie"] = opts.cookie;
  if (opts.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    redirect: "manual",
  });

  const body: Record<string, unknown> | null = await res.json().catch(() => null);
  return { status: res.status, body };
}

let userCookie = "";
let adminCookie = "";

async function setupUsers(): Promise<void> {
  // Register regular user
  const email = uniqueEmail();
  const reg = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Admin Test User", email, password: "Password123!" }),
    redirect: "manual",
  });
  if (reg.status !== 201) throw new Error(`setup: register failed, got ${reg.status}`);
  userCookie = (reg.headers.get("set-cookie") || "").split(";")[0];

  // Try to login as admin (known credentials)
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "techemma@gmail.com", password: "123456" }),
    redirect: "manual",
  });
  if (loginRes.status === 200) {
    adminCookie = (loginRes.headers.get("set-cookie") || "").split(";")[0];
  }
}

async function testAnalyticsWithoutAuth(): Promise<void> {
  const { status } = await request("GET", "/admin/analytics");
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function testAnalyticsAsNonAdmin(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status } = await request("GET", "/admin/analytics", { cookie: userCookie });
  if (status !== 403) throw new Error(`expected 403, got ${status}`);
}

async function testAdminOrdersWithoutAuth(): Promise<void> {
  const { status } = await request("GET", "/admin/orders");
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function testAdminOrdersAsNonAdmin(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status } = await request("GET", "/admin/orders", { cookie: userCookie });
  if (status !== 403) throw new Error(`expected 403, got ${status}`);
}

async function testUpdateOrderStatusWithoutAuth(): Promise<void> {
  const { status } = await request("PUT", "/admin/orders/507f1f77bcf86cd799439011/status", {
    body: { status: "confirmed" },
  });
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function testAdminProductsWithoutAuth(): Promise<void> {
  const { status } = await request("GET", "/admin/products");
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function testAdminProductsAsNonAdmin(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status } = await request("GET", "/admin/products", { cookie: userCookie });
  if (status !== 403) throw new Error(`expected 403, got ${status}`);
}

async function testAnalyticsAsAdmin(): Promise<void> {
  if (!adminCookie) {
    process.stderr.write("skipped analytics admin test: no admin credentials\n");
    return;
  }
  const { status, body } = await request("GET", "/admin/analytics", { cookie: adminCookie });
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Admin analytics retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  if (typeof body?.totalSales !== "number") throw new Error("missing totalSales");
  if (typeof body?.totalOrders !== "number") throw new Error("missing totalOrders");
  if (typeof body?.totalProducts !== "number") throw new Error("missing totalProducts");
}

async function testAdminOrdersAsAdmin(): Promise<void> {
  if (!adminCookie) {
    process.stderr.write("skipped orders admin test: no admin credentials\n");
    return;
  }
  const { status, body } = await request("GET", "/admin/orders?page=1&limit=5", { cookie: adminCookie });
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  const pagination = body?.pagination as Record<string, unknown>;
  if (!pagination || typeof pagination.total !== "number") throw new Error("missing pagination");
}

async function main(): Promise<void> {
  await setupUsers();

  const tests: (() => Promise<void>)[] = [
    testAnalyticsWithoutAuth,
    testAnalyticsAsNonAdmin,
    testAdminOrdersWithoutAuth,
    testAdminOrdersAsNonAdmin,
    testUpdateOrderStatusWithoutAuth,
    testAdminProductsWithoutAuth,
    testAdminProductsAsNonAdmin,
    // Admin happy-path tests (skipped if no admin creds)
    testAnalyticsAsAdmin,
    testAdminOrdersAsAdmin,
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
