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

// 🔥 SỬA LỖI TRẮNG MÀN HÌNH DANH SÁCH ĐƠN HÀNG
export const getOrderListData = createAsyncThunk(
  "get/orderData",
  async (data: GetOrderFilterParams) => {
    const response = await useCallAPI({
      method: "GET",
      url: `${URL_API}/orders/history`,
      token: data.token,
    });

    // Bắt lỗi chuẩn hơn: Dù Backend trả về success = false hay status = error
    if (response?.success === false || response?.status === "error") {
      return {
        success: false,
        message: response?.message || "Lỗi tải lịch sử",
      };
    }

    // 🔥 BÙA BỐC DỮ LIỆU CHUẨN: Lục tung response để tìm mảng đơn hàng
    // Vì Backend gửi res.json({ status: "success", data: orders })
    let rawOrders = [];
    if (Array.isArray(response)) rawOrders = response;
    else if (Array.isArray(response?.data)) rawOrders = response.data;
    else if (Array.isArray(response?.data?.data))
      rawOrders = response.data.data;

    const orders = rawOrders.map(normalizeOrder);

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

    if (response?.success === false || response?.status === "error") {
      return {
        success: false,
        message: response?.message || "Lỗi tải chi tiết",
      };
    }

    // Tương tự, bốc dữ liệu linh hoạt
    let rawItems = [];
    if (Array.isArray(response)) rawItems = response;
    else if (Array.isArray(response?.data)) rawItems = response.data;

    return {
      success: true,
      data: rawItems.map(normalizeOrderItems),
    };
  },
);

export const createOrder = createAsyncThunk(
  "post/createOrder",
  async ({ data, token }: any) => {
    const response = await useCallAPI({
      method: "POST",
      url: `${URL_API}/orders/create`,
      data: data,
      token: token,
    });

    // Ép trả về kết quả có order_id chuẩn
    const resultData = response?.result || response?.data || response;
    return {
      success: true,
      result: {
        ...resultData,
        order_id: resultData.order_id || resultData.id || response.order_id, // Đảm bảo luôn có order_id
      },
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
          const data = Array.isArray(action.payload.data)
            ? action.payload.data
            : [];
          state.hasMorePaginationOrderListData = false;
          state.paginationOrderListData = data;
          state.currentPagePaginationOrderListData = 2;
          state.hasFetchedPaginationOrderListData = true;
        } else {
          state.orderError = action.payload?.message || "Failed";
        }
      })
      .addCase(
        getOrderListData.rejected,
        (state, action: PayloadAction<any>) => {
          state.orderLoading = false;
          state.orderError = action.payload || "Failed";
        },
      )
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
          const data = Array.isArray(action.payload.data)
            ? action.payload.data
            : [];
          state.hasMorePaginationOrderItemsData = false;
          state.paginationOrderItemsData = data;
          state.currentPagePaginationOrderItemsData = 2;
          state.hasFetchedPaginationOrderItemsData = true;
        } else {
          state.orderError = action.payload?.message || "Failed";
        }
      })
      .addCase(
        getOrderItemsData.rejected,
        (state, action: PayloadAction<any>) => {
          state.orderLoading = false;
          state.orderError = action.payload || "Failed";
        },
      );
  },
});

export const {
  resetAllOrderData,
  resetOrderListData,
  resetOrderItemsData,
  resetCreateOrderResponse,
} = orderSlice.actions;

export default orderSlice.reducer;
