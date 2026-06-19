export const formatPrice = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const itemPrice = (price: number, cents = 0) => {
  return price + cents / 100;
};

export type StockStatus = "in-stock" | "low" | "out";

export const getStockDisplay = ({
  stockCount,
}: {
  stockCount?: number;
}) => {
  if (stockCount === 0) {
    return { text: "Out of stock", status: "out" as const };
  }
  if (typeof stockCount === "number" && stockCount <= 5) {
    return { text: `Only ${stockCount} left`, status: "low" as const };
  }
  return { text: "Many in stock", status: "in-stock" as const };
};


export const splitPrice = (price: number) => {
  const [dollars, cents = "00"] = price.toFixed(2).split(".");
  return { dollars: Number(dollars), cents: Number(cents) };
};
