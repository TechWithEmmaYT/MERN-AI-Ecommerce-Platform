const BASE = "https://instant-cart.onrender.com/api";

function uniqueEmail(): string {
  return `testrev${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
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
let orderId = "";
let orderItemId = "";

async function setupUserAndOrder(): Promise<void> {
  const email = uniqueEmail();
  const reg = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Review Test User", email, password: "Password123!" }),
    redirect: "manual",
  });
  if (reg.status !== 201) throw new Error(`setup: register failed, got ${reg.status}`);
  userCookie = (reg.headers.get("set-cookie") || "").split(";")[0];

  // Fetch a product
  const prodRes = await fetch(`${BASE}/products?limit=1`, { redirect: "manual" });
  const prodData: Record<string, unknown> = await prodRes.json();
  const products = prodData.products as Record<string, unknown>[];
  if (!products || products.length === 0) throw new Error("setup: no products");
  const productId = products[0]._id as string;

  // Add to cart
  const cartRes = await fetch(`${BASE}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({ items: [{ productId, quantity: 1 }] }),
    redirect: "manual",
  });
  if (cartRes.status !== 200) throw new Error(`setup: add to cart failed, got ${cartRes.status}`);

  // Create address
  const addrRes = await fetch(`${BASE}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({ recipientName: "Rev User", phone: "+1", street: "1 St", city: "City", state: "ST", postalCode: "00000", country: "US" }),
    redirect: "manual",
  });
  if (addrRes.status !== 201) throw new Error(`setup: create address failed, got ${addrRes.status}`);
  const addrData: Record<string, unknown> = await addrRes.json();
  const addressId = (addrData.address as Record<string, unknown>)._id as string;

  // Create COD order
  const ordRes = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({ addressId, paymentMethod: "cash_on_delivery" }),
    redirect: "manual",
  });
  if (ordRes.status !== 201) throw new Error(`setup: create order failed, got ${ordRes.status}`);
  const ordData: Record<string, unknown> = await ordRes.json();
  const order = ordData.order as Record<string, unknown>;
  orderId = order._id as string;
  const items = order.items as Record<string, unknown>[];
  if (!items || items.length === 0) throw new Error("setup: order has no items");
  orderItemId = items[0]._id as string;
}

async function testCreateReviewWithoutAuth(): Promise<void> {
  const { status } = await request("POST", "/reviews", {
    body: { orderId: "abc", orderItemId: "def", rating: 5 },
  });
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function testCreateReviewInvalidIds(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status } = await request("POST", "/reviews", {
    cookie: userCookie,
    body: { orderId: "invalid", orderItemId: "invalid", rating: 5 },
  });
  if (status !== 400) throw new Error(`expected 400, got ${status}`);
}

async function testCreateReviewNotDelivered(): Promise<void> {
  // The order is only "placed", not "delivered" — should get 400
  if (!userCookie || !orderId || !orderItemId) throw new Error("no setup state");
  const { status } = await request("POST", "/reviews", {
    cookie: userCookie,
    body: { orderId, orderItemId, rating: 4, comment: "Great product!" },
  });
  // Order is placed (COD, not delivered) — expect 400: "Order must be delivered and paid"
  if (status !== 400) throw new Error(`expected 400, got ${status}`);
}

async function testGetReviewableReturns200(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status, body } = await request("GET", "/reviews/reviewable", { cookie: userCookie });
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Reviewable items retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const orders = body?.orders as Record<string, unknown>[];
  if (!Array.isArray(orders)) throw new Error("orders is not an array");
}

async function testGetUserReviewsReturns200(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status, body } = await request("GET", "/reviews", { cookie: userCookie });
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Reviews retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const reviews = body?.reviews as Record<string, unknown>[];
  if (!Array.isArray(reviews)) throw new Error("reviews is not an array");
}

async function main(): Promise<void> {
  await setupUserAndOrder();

  const tests: (() => Promise<void>)[] = [
    testCreateReviewWithoutAuth,
    testCreateReviewInvalidIds,
    testCreateReviewNotDelivered,
    testGetReviewableReturns200,
    testGetUserReviewsReturns200,
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
