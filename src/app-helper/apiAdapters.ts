import { domain } from "./urlAPI";

type ProductFilter = {
  page?: number;
  limit?: number;
  filterColumn?: string;
  filterValue?: string | number;
  type?: "all" | "drinks" | "fast_food" | "snacks";
};

const CATEGORY_BY_ID: Record<string, string> = {
  "1": "fast_food",
  "2": "drinks",
  "3": "snacks",
};

export const normalizeImageUrl = (image?: string | null) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${domain}${image.startsWith("/") ? image : `/${image}`}`;
};

export const inferCategory = (product: any) => {
  if (typeof product?.category === "string" && product.category.trim()) {
    return product.category.trim().toLowerCase();
  }

  if (product?.category_id != null) {
    return CATEGORY_BY_ID[String(product.category_id)] || "other";
  }

  return "other";
};

export const normalizeProduct = (product: any) => {
  const normalizedPrice = Number(product?.price ?? 0);

  return {
    ...product,
    id: Number(product?.id ?? 0),
    product_id: Number(product?.product_id ?? product?.id ?? 0),
    category: inferCategory(product),
    image: normalizeImageUrl(product?.image),
    price: Number.isNaN(normalizedPrice) ? 0 : normalizedPrice,
    description: product?.description ?? "",
  };
};

export const paginateArray = <T>(items: T[], page = 1, limit = 10) => {
  const start = Math.max(page - 1, 0) * limit;
  return items.slice(start, start + limit);
};

export const filterProducts = (products: any[], params: ProductFilter) => {
  const normalized = products.map(normalizeProduct);
  const { filterColumn, filterValue, type = "all" } = params;

  let filtered = normalized;

  if (type && type !== "all") {
    filtered = filtered.filter((item) => item.category === type);
  }

  if (filterColumn && filterValue !== undefined && filterValue !== null && String(filterValue).trim() !== "") {
    const keyword = String(filterValue).trim().toLowerCase();

    filtered = filtered.filter((item) => {
      const fieldValue = item?.[filterColumn];
      if (fieldValue == null) return false;
      return String(fieldValue).toLowerCase().includes(keyword);
    });
  }

  return paginateArray(filtered, params.page, params.limit);
};

export const normalizeCartItems = (items: any[]) => {
  return items.map((item) => {
    const normalized = normalizeProduct(item);
    const quantity = Number(item?.quantity ?? 0);
    const total = Number(item?.total ?? normalized.price * quantity);

    return {
      ...normalized,
      cart_id: 1,
      quantity,
      total: total,
      total_price: total,
    };
  });
};

export const buildCartSummary = (items: any[]) => {
  const normalizedItems = normalizeCartItems(items);
  const totalPrice = normalizedItems.reduce((sum, item) => sum + Number(item.total_price ?? 0), 0);

  return {
    id: 1,
    user_id: 1,
    total_price: totalPrice,
    items_count: normalizedItems.length,
  };
};

export const normalizeOrder = (order: any) => ({
  ...order,
  id: Number(order?.id ?? order?.order_id ?? 0),
  total_price: Number(order?.total_price ?? order?.total_paid ?? 0),
  order_status: order?.order_status ?? order?.status ?? "pending",
  status: order?.status ?? order?.order_status ?? "pending",
  payment_status: order?.payment_status ?? "pending",
  address: order?.address ?? "",
});

export const normalizeOrderItems = (items: any[]) => {
  return items.map((item) => {
    const normalized = normalizeProduct(item);
    const quantity = Number(item?.quantity ?? 0);
    const price = Number(item?.price ?? 0);

    return {
      ...normalized,
      order_id: Number(item?.order_id ?? item?.id ?? 0),
      quantity,
      price,
      total_price: price * quantity,
      payment_status: item?.payment_status ?? "pending",
      order_status: item?.status ?? item?.order_status ?? "pending",
      status: item?.status ?? item?.order_status ?? "pending",
      address: item?.address ?? "",
      created_at: item?.created_at,
    };
  });
};
