const BASE = "https://instant-cart.onrender.com/api";

function uniqueEmail(): string {
  return `testord${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
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
let productId = "";
let addressId = "";

async function setupUserAndCart(): Promise<void> {
  const email = uniqueEmail();
  const reg = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Order Test User", email, password: "Password123!" }),
    redirect: "manual",
  });
  if (reg.status !== 201) throw new Error(`setup: register failed, got ${reg.status}`);
  userCookie = (reg.headers.get("set-cookie") || "").split(";")[0];

  // Fetch a product
  const prodRes = await fetch(`${BASE}/products?limit=1`, { redirect: "manual" });
  const prodData: Record<string, unknown> = await prodRes.json();
  const products = prodData.products as Record<string, unknown>[];
  if (!products || products.length === 0) throw new Error("setup: no products");
  productId = products[0]._id as string;

  // Add to cart
  const cartRes = await fetch(`${BASE}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({ items: [{ productId, quantity: 2 }] }),
    redirect: "manual",
  });
  if (cartRes.status !== 200) throw new Error(`setup: add to cart failed, got ${cartRes.status}`);

  // Create address
  const addrRes = await fetch(`${BASE}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({ recipientName: "Jane Doe", phone: "+1234567890", street: "456 Oak Ave", city: "Los Angeles", state: "CA", postalCode: "90001", country: "US" }),
    redirect: "manual",
  });
  if (addrRes.status !== 201) throw new Error(`setup: create address failed, got ${addrRes.status}`);
  const addrData: Record<string, unknown> = await addrRes.json();
  addressId = (addrData.address as Record<string, unknown>)._id as string;
}

async function testCreateOrderWithoutAuth(): Promise<void> {
  const { status } = await request("POST", "/orders", {
    body: { addressId: "abc123", paymentMethod: "cash_on_delivery" },
  });
  if (status !== 401) throw new Error(`expected 401, got ${status}`);
}

async function testCreateOrderInvalidAddress(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status } = await request("POST", "/orders", {
    cookie: userCookie,
    body: { addressId: "507f1f77bcf86cd799439011", paymentMethod: "cash_on_delivery" },
  });
  if (status !== 404) throw new Error(`expected 404, got ${status}`);
}

async function testCreateOrderCOD(): Promise<void> {
  if (!userCookie || !addressId) throw new Error("no cookie");
  const { status, body } = await request("POST", "/orders", {
    cookie: userCookie,
    body: { addressId, paymentMethod: "cash_on_delivery" },
  });
  if (status !== 201) throw new Error(`expected 201, got ${status}`);
  if (body?.message !== "Order placed successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const order = body?.order as Record<string, unknown>;
  if (!order) throw new Error("missing order");
  if (order.paymentMethod !== "cash_on_delivery") throw new Error("wrong payment method");
  if (order.status !== "placed") throw new Error(`expected status placed, got ${order.status}`);
  if (typeof order.orderNo !== "string") throw new Error("missing orderNo");
}

async function testGetOrdersReturns200(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status, body } = await request("GET", "/orders", { cookie: userCookie });
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Orders retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const orders = body?.orders as Record<string, unknown>[];
  if (!Array.isArray(orders)) throw new Error("orders is not an array");
  if (orders.length === 0) throw new Error("orders array is empty");
}

async function testGetOrderById200(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  // First get all orders to find one
  const listRes = await fetch(`${BASE}/orders`, {
    headers: { cookie: userCookie },
    redirect: "manual",
  });
  const listData: Record<string, unknown> = await listRes.json();
  const orders = listData.orders as Record<string, unknown>[];
  if (!orders || orders.length === 0) throw new Error("no orders to test");
  const orderId = orders[0]._id as string;

  const { status, body } = await request("GET", `/orders/${orderId}`, { cookie: userCookie });
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Order retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const order = body?.order as Record<string, unknown>;
  if (!order) throw new Error("missing order");
  if (order._id !== orderId) throw new Error("order id mismatch");
}

async function testGetOrderById404(): Promise<void> {
  if (!userCookie) throw new Error("no cookie");
  const { status } = await request("GET", "/orders/507f1f77bcf86cd799439011", { cookie: userCookie });
  if (status !== 404) throw new Error(`expected 404, got ${status}`);
}

async function main(): Promise<void> {
  await setupUserAndCart();

  const tests: (() => Promise<void>)[] = [
    testCreateOrderWithoutAuth,
    testCreateOrderInvalidAddress,
    testCreateOrderCOD,
    testGetOrdersReturns200,
    testGetOrderById200,
    testGetOrderById404,
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
