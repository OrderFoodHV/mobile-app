type CartDataSuccess = {
    id: number;
    user_id: number;
    total_price: string | number;
    created_at?: string;
    updated_at?: string;
    items_count?: number;
}

export type CartFilterParams = {
  page: number,
  limit:number,
  filterColumn: string, 
  filterValue: string | number,
  token?: string,
}

export type ProductCartData = {
  cart_id: number;
  id?:number| string
  product_id: number | string;
  quantity: number;
  price: string | number;
  total_price: string | number;
  name: string;
  category: string;
  image: string;
  description: string;
  token?: string;
};

export type CartItemUpdateData = {
  cart_id: number;
  product_id: number;
  quantity: number;
  price: string | number;
};

type UpdateCartItemResponse = {
  success: boolean;
  response: {
    cart_id: number;
    product_id: number;
    quantity: number;
    total_price: string | number;
  };
};


export type CartProps = {
  cartData: CartDataSuccess | null
  productCartListData: ProductCartData[] | null
  increaseProductQuantityInCartResponse: UpdateCartItemResponse | null | any
  hasFetchedProductCartListData: boolean,
  hasMoreProductCartListData: boolean
  currentPageProductCartListData: number
  hasFetchedCartData: boolean,
  cartError: string | null,
  cartLoading: boolean
}
