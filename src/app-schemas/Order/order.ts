export type GetOrderFilterParams = {
  page?: number,
  limit?: number,
  filterColumn?: string,
  filterValue?: string | number,
  token: string
}
export type GetOrderItemsFilterParams = {
  page?: number,
  limit?: number,
  filterColumn?: string,
  filterValue?: string | number,
}
type OrderItem = {
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  name: string;
  category: string;
  image: string;
  description: string;
};

export type Order = {
  total_price: number;
  payment_status: "paid" | "unpaid" | "pending";
  order_status: "pending" | "completed" | "cancelled";
  address: string;
  items: OrderItem[];
};
export type CreateOrderDataSend = {
  data: Order,
  token: string
};


export type OrderProps = {
  paginationOrderListData: any | null;
  hasFetchedPaginationOrderListData: boolean;
  hasMorePaginationOrderListData: boolean;
  currentPagePaginationOrderListData: number;
  paginationOrderItemsData: any
  hasFetchedPaginationOrderItemsData: boolean;
  hasMorePaginationOrderItemsData: boolean;
  currentPagePaginationOrderItemsData: number;
  createOrderResponse: any
  orderError: any | null;
  orderLoading: boolean;
};