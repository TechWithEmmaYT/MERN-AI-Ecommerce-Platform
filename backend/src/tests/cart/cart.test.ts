const BASE = "https://instant-cart.onrender.com/api";

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

  const setCookie = res.headers.get("set-cookie") || "";
  const body: Record<string, unknown> | null = await res.json().catch(() => null);
  return { status: res.status, body, setCookie };
}

let guestCookie = "";
let productId = "";

async function fetchFirstProductId(): Promise<string> {
  const res = await fetch(`${BASE}/products?limit=1`, { redirect: "manual" });
  const body: Record<string, unknown> = await res.json();
  const products = body.products as Record<string, unknown>[];
  if (!products || products.length === 0) throw new Error("no products in DB");
  return products[0]._id as string;
}

async function testAddToCartAsGuest(): Promise<void> {
  productId = await fetchFirstProductId();
  const { status, body, setCookie } = await request("POST", "/cart", {
    body: { items: [{ productId, quantity: 2 }] },
  });

  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Cart updated successfully")
    throw new Error(`wrong message: ${body?.message}`);

  guestCookie = setCookie.split(";")[0];
  if (!guestCookie.startsWith("instant_guest_cart_id="))
    throw new Error("missing guest cart cookie");

  const cart = body?.cart as Record<string, unknown>;
  if (!cart) throw new Error("missing cart");
  const items = cart.items as Record<string, unknown>[];
  if (!items || items.length === 0) throw new Error("cart items is empty");
  const first = items[0];
  if ((first.quantity as number) !== 2) throw new Error(`expected qty 2, got ${first.quantity}`);
  if (typeof body?.subtotal !== "number") throw new Error("missing subtotal");
  if (typeof body?.orderTotal !== "number") throw new Error("missing orderTotal");
}

async function testGetCartReturnsItems(): Promise<void> {
  if (!guestCookie) throw new Error("no guest cookie from previous test");
  const { status, body } = await request("GET", "/cart", { cookie: guestCookie });

  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Cart retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const cart = body?.cart as Record<string, unknown>;
  if (!cart) throw new Error("missing cart");
  const items = cart.items as Record<string, unknown>[];
  if (!items || items.length === 0) throw new Error("cart items is empty");
}

async function testUpdateCartQuantity(): Promise<void> {
  if (!guestCookie || !productId) throw new Error("missing test state");
  const { status, body } = await request("POST", "/cart", {
    cookie: guestCookie,
    body: { items: [{ productId, quantity: 5 }] },
  });

  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  const items = (body?.cart as Record<string, unknown>).items as Record<string, unknown>[];
  if ((items[0].quantity as number) !== 5) throw new Error(`expected qty 5, got ${items[0].quantity}`);
}

async function testAddMultipleItems(): Promise<void> {
  if (!guestCookie) throw new Error("missing test state");
  // Fetch another product
  const res = await fetch(`${BASE}/products?limit=2`, { redirect: "manual" });
  const data: Record<string, unknown> = await res.json();
  const products = data.products as Record<string, unknown>[];
  if (products.length < 2) return;

  const secondId = products[1]._id as string;
  const { status, body } = await request("POST", "/cart", {
    cookie: guestCookie,
    body: { items: [{ productId, quantity: 5 }, { productId: secondId, quantity: 1 }] },
  });

  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  const items = (body?.cart as Record<string, unknown>).items as Record<string, unknown>[];
  if (items.length < 2) throw new Error("expected at least 2 items in cart");
}

async function testClearCart(): Promise<void> {
  if (!guestCookie) throw new Error("missing test state");
  const { status, body } = await request("POST", "/cart", {
    cookie: guestCookie,
    body: { items: [] },
  });

  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  const items = (body?.cart as Record<string, unknown>).items as Record<string, unknown>[];
  if (items.length !== 0) throw new Error("expected empty cart after clearing");
  if ((body?.subtotal as number) !== 0) throw new Error("expected subtotal 0");
  if ((body?.orderTotal as number) !== 0) throw new Error("expected orderTotal 0");
}

async function main(): Promise<void> {
  const tests: (() => Promise<void>)[] = [
    testAddToCartAsGuest,
    testGetCartReturnsItems,
    testUpdateCartQuantity,
    testAddMultipleItems,
    testClearCart,
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
