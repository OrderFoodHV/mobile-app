import { normalizeOrder, normalizeOrderItems } from "@app-helper/apiAdapters";
import URL_API from "@app-helper/urlAPI";
import useCallAPI from "@app-helper/useCallAPI";
import {
  CreateOrderDataSend,
  GetOrderFilterParams,
  GetOrderItemsFilterParams,
  OrderProps,
} from "@app-schemas/Order/order";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: OrderProps = {
  currentPagePaginationOrderListData: 1,
  hasFetchedPaginationOrderListData: false,
  hasMorePaginationOrderListData: true,
  paginationOrderListData: null,
  currentPagePaginationOrderItemsData: 1,
  hasFetchedPaginationOrderItemsData: false,
  hasMorePaginationOrderItemsData: true,
  paginationOrderItemsData: null,
  createOrderResponse: null,
  orderError: null,
  orderLoading: false,
};

export const getOrderListData = createAsyncThunk(
  "get/orderData",
  async (data: GetOrderFilterParams) => {
    const response = await useCallAPI({
      method: "GET",
      url: `${URL_API}/orders/history`,
      token: data.token,
    });

    if (response?.success === false) {
      return response;
    }

    const orders = Array.isArray(response) ? response.map(normalizeOrder) : [];

    return {
      success: true,
      data: orders,
    };
  },
);

export const getOrderItemsData = createAsyncThunk(
  "get/orderItemsData",
  async (data: GetOrderItemsFilterParams & { token?: string }) => {
    const response = await useCallAPI({
      method: "GET",
      url: `${URL_API}/orders/${data.filterValue}`,
      token: data.token,
    });

    if (response?.success === false) {
      return response;
    }

    return {
      success: true,
      data: Array.isArray(response) ? normalizeOrderItems(response) : [],
    };
  },
);

export const createOrder = createAsyncThunk(
  "post/createData",
  async (data: CreateOrderDataSend) => {
    const response = await useCallAPI({
      method: "POST",
      url: `${URL_API}/orders/create`,
      data: {
        address: data.data.address,
      },
      token: data.token,
    });

    if (response?.success === false) {
      return response;
    }

    return {
      success: true,
      message: response?.message || "Đặt hàng thành công",
      result: normalizeOrder({
        order_id: response?.order_id,
        total_paid: response?.total_paid,
        status: response?.status,
        address: data.data.address,
      }),
    };
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetAllOrderData: () => initialState,
    resetOrderListData: (state) => {
      state.currentPagePaginationOrderListData = 1;
      state.hasFetchedPaginationOrderListData = false;
      state.hasMorePaginationOrderListData = true;
      state.paginationOrderListData = null;
      state.orderError = null;
      state.orderLoading = false;
    },
    resetOrderItemsData: (state) => {
      state.currentPagePaginationOrderItemsData = 1;
      state.hasFetchedPaginationOrderItemsData = false;
      state.hasMorePaginationOrderItemsData = true;
      state.paginationOrderItemsData = null;
      state.orderError = null;
      state.orderLoading = false;
    },
    resetCreateOrderResponse: (state) => {
      state.createOrderResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrderListData.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(getOrderListData.fulfilled, (state, action) => {
        state.orderLoading = false;

        if (action.payload?.success) {
          const data = Array.isArray(action.payload.data) ? action.payload.data : [];
          state.hasMorePaginationOrderListData = false;
          state.paginationOrderListData = data;
          state.currentPagePaginationOrderListData = 2;
          state.hasFetchedPaginationOrderListData = true;
        } else {
          state.orderError = action.payload?.message || "Failed";
        }
      })
      .addCase(getOrderListData.rejected, (state, action: PayloadAction<any>) => {
        state.orderLoading = false;
        state.orderError = action.payload || "Failed";
      })
      .addCase(createOrder.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.createOrderResponse = action.payload;

        if (!action.payload?.success) {
          state.orderError = action.payload?.message || "Failed";
        }
      })
      .addCase(createOrder.rejected, (state, action: PayloadAction<any>) => {
        state.orderLoading = false;
        state.orderError = action.payload || "Failed";
      })
      .addCase(getOrderItemsData.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(getOrderItemsData.fulfilled, (state, action) => {
        state.orderLoading = false;

        if (action.payload?.success) {
          const data = Array.isArray(action.payload.data) ? action.payload.data : [];
          state.hasMorePaginationOrderItemsData = false;
          state.paginationOrderItemsData = data;
          state.currentPagePaginationOrderItemsData = 2;
          state.hasFetchedPaginationOrderItemsData = true;
        } else {
          state.orderError = action.payload?.message || "Failed";
        }
      })
      .addCase(getOrderItemsData.rejected, (state, action: PayloadAction<any>) => {
        state.orderLoading = false;
        state.orderError = action.payload || "Failed";
      });
  },
});

export const {
  resetAllOrderData,
  resetOrderListData,
  resetOrderItemsData,
  resetCreateOrderResponse,
} = orderSlice.actions;

export default orderSlice.reducer;
