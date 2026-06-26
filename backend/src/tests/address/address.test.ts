const BASE = "https://instant-cart.onrender.com/api";

function uniqueEmail(): string {
  return `testaddr${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
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

async function registerUser(): Promise<void> {
  const email = uniqueEmail();
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Address Test User", email, password: "Password123!" }),
    redirect: "manual",
  });
  if (res.status !== 201) throw new Error(`setup: register failed, got ${res.status}`);
  userCookie = (res.headers.get("set-cookie") || "").split(";")[0];
}

async function testCreateAddressWithoutAuth(): Promise<void> {
  const { status } = await request("POST", "/addresses", {
    body: { recipientName: "Test", phone: "123", street: "St", city: "City", state: "St", postalCode: "123", country: "US" },
  });
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function testCreateAddressValid(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status, body } = await request("POST", "/addresses", {
    cookie: userCookie,
    body: { recipientName: "John Doe", phone: "+1234567890", street: "123 Main St", city: "New York", state: "NY", postalCode: "10001", country: "US" },
  });
  if (status !== 201) throw new Error(`expected 201, got ${status}`);
  if (body?.message !== "Address created successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const addr = body?.address as Record<string, unknown>;
  if (!addr) throw new Error("missing address");
  if (addr.recipientName !== "John Doe") throw new Error("wrong recipientName");
  if (addr.isDefault !== true) throw new Error("address should be default");
}

async function testCreateAddressMissingFields(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status } = await request("POST", "/addresses", {
    cookie: userCookie,
    body: { recipientName: "No Phone" },
  });
  if (status !== 400) throw new Error(`expected 400, got ${status}`);
}

async function testGetAddressesReturns200(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status, body } = await request("GET", "/addresses", { cookie: userCookie });
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Addresses retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const addrs = body?.addresses as Record<string, unknown>[];
  if (!Array.isArray(addrs)) throw new Error("addresses is not an array");
  if (addrs.length === 0) throw new Error("addresses array is empty");
}

async function testGetAddressesWithoutAuth(): Promise<void> {
  const { status } = await request("GET", "/addresses");
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function main(): Promise<void> {
  await registerUser();

  const tests: (() => Promise<void>)[] = [
    testCreateAddressWithoutAuth,
    testCreateAddressValid,
    testCreateAddressMissingFields,
    testGetAddressesReturns200,
    testGetAddressesWithoutAuth,
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
