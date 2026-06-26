const BASE = "https://instant-cart.onrender.com/api";

function uniqueEmail(): string {
  return `testuser${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
}

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

async function testRegisterHappyPath(): Promise<void> {
  const email = uniqueEmail();
  const { status, body, setCookie } = await request("POST", "/auth/register", {
    body: { name: "Test User", email, password: "Password123!" },
  });

  if (status !== 201) throw new Error(`register happy path: expected 201, got ${status}`);
  if (body?.message !== "User registered successfully")
    throw new Error(`register happy path: wrong message: ${body?.message}`);
  if ((body?.user as Record<string, unknown>)?.name !== "Test User")
    throw new Error(`register happy path: wrong name`);
  if ((body?.user as Record<string, unknown>)?.email !== email)
    throw new Error(`register happy path: wrong email`);
  if (!(body?.user as Record<string, unknown>)?._id) throw new Error("register happy path: missing _id");
  if (!setCookie.includes("instant_access_token"))
    throw new Error("register happy path: missing instant_access_token cookie");
}

async function testRegisterDuplicateEmail(): Promise<void> {
  const email = uniqueEmail();
  await request("POST", "/auth/register", {
    body: { name: "First", email, password: "Password123!" },
  });
  const { status } = await request("POST", "/auth/register", {
    body: { name: "Second", email, password: "Password123!" },
  });

  if (status !== 400) throw new Error(`duplicate email: expected 400, got ${status}`);
}

async function testRegisterMissingName(): Promise<void> {
  const { status } = await request("POST", "/auth/register", {
    body: { email: uniqueEmail(), password: "Password123!" },
  });
  if (status !== 400) throw new Error(`missing name: expected 400, got ${status}`);
}

async function testRegisterShortPassword(): Promise<void> {
  const { status } = await request("POST", "/auth/register", {
    body: { name: "Test", email: uniqueEmail(), password: "123" },
  });
  if (status !== 400) throw new Error(`short password: expected 400, got ${status}`);
}

async function main(): Promise<void> {
  const tests: (() => Promise<void>)[] = [
    testRegisterHappyPath,
    testRegisterDuplicateEmail,
    testRegisterMissingName,
    testRegisterShortPassword,
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
