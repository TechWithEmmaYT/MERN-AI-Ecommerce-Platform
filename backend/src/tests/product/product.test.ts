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

  const body: Record<string, unknown> | null = await res.json().catch(() => null);
  return { status: res.status, body };
}

let firstSlug = "";
let totalProducts = 0;

async function testGetProductsReturns200(): Promise<void> {
  const { status, body } = await request("GET", "/products?limit=5");
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Products retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const products = body?.products as Record<string, unknown>[];
  if (!Array.isArray(products)) throw new Error("products is not an array");
  if (products.length === 0) throw new Error("products array is empty");
  const pagination = body?.pagination as Record<string, unknown>;
  if (!pagination || typeof pagination.total !== "number")
    throw new Error("missing valid pagination");

  totalProducts = pagination.total as number;
  firstSlug = products[0].slug as string;
  if (!firstSlug) throw new Error("product missing slug");
}

async function testGetProductBySlugReturns200(): Promise<void> {
  if (!firstSlug) throw new Error("no slug from previous test");
  const { status, body } = await request("GET", `/products/${firstSlug}`);
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Product retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const product = body?.product as Record<string, unknown>;
  if (!product) throw new Error("missing product");
  if (product.slug !== firstSlug) throw new Error("slug mismatch");
  if (typeof product.name !== "string") throw new Error("missing name");
  if (typeof product.salePrice !== "number") throw new Error("missing salePrice");
  const related = body?.relatedProducts as Record<string, unknown>[];
  if (!Array.isArray(related)) throw new Error("missing relatedProducts");
}

async function testGetProductBySlug404(): Promise<void> {
  const { status } = await request("GET", "/products/nonexistent-slug-12345");
  if (status !== 404) throw new Error(`expected 404, got ${status}`);
}

async function testGetDealsReturns200(): Promise<void> {
  const { status, body } = await request("GET", "/products/deals?limit=5");
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Deals retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const products = body?.products as Record<string, unknown>[];
  if (!Array.isArray(products)) throw new Error("deals is not an array");
}

async function testGetProductsWithHasDiscount(): Promise<void> {
  const { status, body } = await request("GET", "/products?hasDiscount=true&limit=3");
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  const products = body?.products as Record<string, unknown>[];
  if (!Array.isArray(products)) throw new Error("products is not an array");
  for (const p of products) {
    if ((p.discountPercent as number) <= 0)
      throw new Error(`product ${p.slug} has no discount but hasDiscount=true`);
  }
}

async function testGetProductsWithKeyword(): Promise<void> {
  const { status, body } = await request("GET", "/products?keyword=a&limit=3");
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  const products = body?.products as Record<string, unknown>[];
  if (!Array.isArray(products)) throw new Error("products is not an array");
}

async function testGetProductsWithPriceSort(): Promise<void> {
  const { status, body } = await request("GET", "/products?sort=price-low&limit=5");
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  const products = body?.products as Record<string, unknown>[];
  if (!Array.isArray(products) || products.length < 2) return;
  for (let i = 1; i < products.length; i++) {
    if ((products[i].salePrice as number) < (products[i - 1].salePrice as number))
      throw new Error("products not sorted by price ascending");
  }
}

async function testGetProductReviews(): Promise<void> {
  if (!firstSlug) throw new Error("no slug from previous test");
  const { status, body } = await request("GET", `/products/${firstSlug}/reviews`);
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Product reviews retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const reviews = body?.reviews as Record<string, unknown>[];
  if (!Array.isArray(reviews)) throw new Error("reviews is not an array");
  const breakdown = body?.ratingBreakdown as Record<string, unknown>[];
  if (!Array.isArray(breakdown)) throw new Error("missing ratingBreakdown");
  if (breakdown.length !== 5) throw new Error("ratingBreakdown should have 5 entries");
}

async function main(): Promise<void> {
  const tests: (() => Promise<void>)[] = [
    testGetProductsReturns200,
    testGetProductBySlugReturns200,
    testGetProductBySlug404,
    testGetDealsReturns200,
    testGetProductsWithHasDiscount,
    testGetProductsWithKeyword,
    testGetProductsWithPriceSort,
    testGetProductReviews,
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
