// hàm format date
export function formatDate(isoDate: any) {
  const date = new Date(isoDate);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const parsePrice = (price: string): number => {
  return parseInt(price.replace(/[^\d]/g, ''), 10); 
};

export const calculateTotalPrice = (quantity: number, price_per_unit: string, price_plus?: number): string => {
  const price = parsePrice(price_per_unit); // Chuyển giá thành số
  const total = quantity * price + ( price_plus ?? 0);
  // Định dạng số tiền theo kiểu Việt Nam (VD: 2.400.000đ)
  return new Intl.NumberFormat('vi-VN').format(total) + 'đ';
};

export const formatCurrencyToNumber = (value: string | number | undefined | null): number => {
  if (!value) return 0; // nếu null/undefined
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    return Number(value.replace(/[^\d]/g, "")) || 0;
  }
  return 0;
};
