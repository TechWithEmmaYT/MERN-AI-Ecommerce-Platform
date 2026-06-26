const BASE = "https://instant-cart.onrender.com/api";

async function request(method: string, path: string) {
  const res = await fetch(`${BASE}${path}`, { method, redirect: "manual" });
  const body: Record<string, unknown> | null = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function testGetCategoriesReturns200(): Promise<void> {
  const { status, body } = await request("GET", "/categories");
  if (status !== 200) throw new Error(`expected 200, got ${status}`);
  if (body?.message !== "Categories retrieved successfully")
    throw new Error(`wrong message: ${body?.message}`);
  const categories = body?.categories as Record<string, unknown>[];
  if (!Array.isArray(categories)) throw new Error("categories is not an array");
  if (categories.length === 0) throw new Error("categories array is empty");
  const first = categories[0];
  if (typeof first._id !== "string") throw new Error("category missing _id");
  if (typeof first.name !== "string") throw new Error("category missing name");
  if (typeof first.slug !== "string") throw new Error("category missing slug");
}

async function main(): Promise<void> {
  const tests: (() => Promise<void>)[] = [testGetCategoriesReturns200];
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
