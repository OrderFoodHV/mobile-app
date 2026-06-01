import { buildCartSummary, normalizeCartItems } from "@app-helper/apiAdapters";
import URL_API from "@app-helper/urlAPI";
import useCallAPI from "@app-helper/useCallAPI";
import {
  CartFilterParams,
  CartItemUpdateData,
  CartProps,
  ProductCartData,
} from "@app-schemas/Cart/cart";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: CartProps = {
  cartData: null,
  hasFetchedCartData: false,
  increaseProductQuantityInCartResponse: null,
  productCartListData: null,
  currentPageProductCartListData: 1,
  hasFetchedProductCartListData: false,
  hasMoreProductCartListData: true,
  cartError: null,
  cartLoading: false,
};

export const getCartData = createAsyncThunk("get/cartData", async (token: string) => {
  const response = await useCallAPI({
    method: "GET",
    url: `${URL_API}/carts`,
    token,
  });

  if (response?.success === false) {
    return response;
  }

  const items = Array.isArray(response) ? normalizeCartItems(response) : [];

  return {
    success: true,
    result: buildCartSummary(items),
    data: items,
  };
});

export const getProductCartListData = createAsyncThunk(
  "get/productCartListData",
  async ({ token }: CartFilterParams & { token?: string }) => {
    const response = await useCallAPI({
      method: "GET",
      url: `${URL_API}/carts`,
      token,
    });

    if (response?.success === false) {
      return response;
    }

    return {
      success: true,
      data: Array.isArray(response) ? normalizeCartItems(response) : [],
    };
  },
);

export const addProductInCart = createAsyncThunk(
  "post/addProductInCart",
  async ({ token, ...data }: ProductCartData & { token?: string }) => {
    const response = await useCallAPI({
      method: "POST",
      url: `${URL_API}/carts/add`,
      data: {
        product_id: data.product_id,
        quantity: data.quantity,
      },
      token,
      showToast: true,
    });

    return {
      ...response,
      success: response?.success !== false,
      response: {
        ...data,
        total_price: Number(data.price) * Number(data.quantity),
      },
    };
  },
);

export const removeProductInCart = createAsyncThunk(
  "delete/removeProductInCart",
  async ({
    product_id,
    cart_id,
    token,
  }: {
    product_id: string | number;
    cart_id: number | string;
    token?: string;
  }) => {
    const response = await useCallAPI({
      method: "DELETE",
      url: `${URL_API}/carts/remove`,
      data: { product_id },
      token,
      showToast: true,
    });

    return {
      ...response,
      success: response?.success !== false,
      response: { product_id, cart_id },
    };
  },
);

export const increaseProductQuantityInCart = createAsyncThunk(
  "put/increaseProductQuantityInCart",
  async ({ token, ...data }: CartItemUpdateData & { token?: string }) => {
    const response = await useCallAPI({
      method: "PUT",
      url: `${URL_API}/carts/update`,
      data: {
        product_id: data.product_id,
        quantity: data.quantity,
      },
      token,
      showToast: true,
    });

    return {
      ...response,
      success: response?.success !== false,
      response: {
        cart_id: data.cart_id,
        product_id: data.product_id,
        quantity: data.quantity,
        total_price: Number(data.price) * Number(data.quantity),
      },
    };
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetAllCart: () => initialState,
    resetCartData: (state) => {
      state.cartData = null;
      state.hasFetchedCartData = false;
      state.cartError = null;
      state.cartLoading = false;
    },
    resetCartDataKeepFetched: (state) => {
      state.cartData = null;
      state.cartError = null;
      state.cartLoading = false;
    },
    resetProductCartListDataKeepFetched: (state) => {
      state.productCartListData = null;
      state.currentPageProductCartListData = 1;
      state.hasMoreProductCartListData = true;
      state.cartError = null;
      state.cartLoading = false;
    },
    resetAllCartKeepFetched: (state) => {
      state.cartData = null;
      state.productCartListData = null;
      state.currentPageProductCartListData = 1;
      state.hasMoreProductCartListData = true;
      state.increaseProductQuantityInCartResponse = null;
      state.cartError = null;
      state.cartLoading = false;
    },
    resetProductCartListData: (state) => {
      state.productCartListData = null;
      state.currentPageProductCartListData = 1;
      state.hasFetchedProductCartListData = false;
      state.hasMoreProductCartListData = true;
      state.cartError = null;
      state.cartLoading = false;
    },
    resetIncreaseProductQuantityInCartResponse: (state) => {
      state.increaseProductQuantityInCartResponse = null;
      state.cartError = null;
      state.cartLoading = false;
    },
    updateQuantityOfProductInCart: (state, action) => {
      if (!state.productCartListData) return;

      const product = state.productCartListData.find(
        (item) => item?.product_id == action.payload?.product_id,
      );

      if (product) {
        product.quantity = action.payload.quantity;
        product.total_price = action.payload.total_price;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCartData.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(getCartData.fulfilled, (state, action) => {
        state.cartLoading = false;

        if (action.payload?.success) {
          state.cartData = action.payload.result;
          state.productCartListData = action.payload.data;
          state.hasFetchedCartData = true;
        } else {
          state.cartError = action.payload?.message || "Get cart failed";
        }
      })
      .addCase(getCartData.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.error.message || "Get cart failed";
      })
      .addCase(increaseProductQuantityInCart.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(increaseProductQuantityInCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.increaseProductQuantityInCartResponse = action.payload;
      })
      .addCase(increaseProductQuantityInCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.error.message || "Update cart failed";
      })
      .addCase(removeProductInCart.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(removeProductInCart.fulfilled, (state, action) => {
        state.cartLoading = false;

        if (action.payload?.success && state.productCartListData) {
          state.productCartListData = state.productCartListData.filter(
            (item) => item?.product_id != action.payload?.response?.product_id,
          );
          state.cartData = buildCartSummary(state.productCartListData);
        }
      })
      .addCase(removeProductInCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.error.message || "Remove cart item failed";
      })
      .addCase(addProductInCart.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(addProductInCart.fulfilled, (state, action) => {
        state.cartLoading = false;

        if (!action.payload?.success) {
          state.cartError = action.payload?.message || "Add cart item failed";
          return;
        }

        if (state.productCartListData && Array.isArray(state.productCartListData)) {
          const index = state.productCartListData.findIndex(
            (item) => item?.product_id == action.payload?.response.product_id,
          );

          if (index !== -1) {
            state.productCartListData[index] = {
              ...state.productCartListData[index],
              quantity:
                Number(state.productCartListData[index].quantity) +
                Number(action.payload.response.quantity),
              total_price:
                Number(state.productCartListData[index].price) *
                (Number(state.productCartListData[index].quantity) +
                  Number(action.payload.response.quantity)),
            };
          } else {
            state.hasFetchedProductCartListData = false;
          }

          state.cartData = buildCartSummary(state.productCartListData);
        }
      })
      .addCase(addProductInCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.error.message || "Add cart item failed";
      })
      .addCase(getProductCartListData.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(getProductCartListData.fulfilled, (state, action) => {
        state.cartLoading = false;

        if (action.payload?.success) {
          const data = Array.isArray(action.payload?.data) ? action.payload.data : [];
          state.hasMoreProductCartListData = false;
          state.productCartListData = data;
          state.currentPageProductCartListData = 2;
          state.hasFetchedProductCartListData = true;
          state.cartData = buildCartSummary(data);
        } else {
          state.cartError = action.payload?.message || "Get cart items failed";
        }
      })
      .addCase(getProductCartListData.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError = action.error.message || "Get data failed";
      });
  },
});

export const {
  resetAllCart,
  resetCartData,
  resetCartDataKeepFetched,
  resetProductCartListData,
  resetProductCartListDataKeepFetched,
  resetAllCartKeepFetched,
  resetIncreaseProductQuantityInCartResponse,
  updateQuantityOfProductInCart,
} = cartSlice.actions;

export default cartSlice.reducer;
