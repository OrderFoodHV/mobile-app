import { filterProducts } from "@app-helper/apiAdapters";
import URL_API from "@app-helper/urlAPI";
import useCallAPI from "@app-helper/useCallAPI";
import {
  FilterParams,
  ProductListProps,
} from "@app-schemas/Product/product-list";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ProductListProps = {
  paginationProductTypeAll: null,
  paginationProductTypeFastFood: null,
  paginationProductTypeDrinks: null,
  paginationProductTypeSnacks: null,
  hasFetchedPaginationProductTypeAll: false,
  hasFetchedPaginationProductTypeFastFood: false,
  hasFetchedPaginationProductTypeDrinks: false,
  hasFetchedPaginationProductTypeSnacks: false,
  hasMorePaginationProductTypeAll: true,
  hasMorePaginationProductTypeFastFood: true,
  hasMorePaginationProductTypeDrinks: true,
  hasMorePaginationProductTypeSnacks: true,
  currentPagePaginationProductTypeAll: 1,
  currentPagePaginationProductTypeFastFood: 1,
  currentPagePaginationProductTypeDrinks: 1,
  currentPagePaginationProductTypeSnacks: 1,
  productListError: null,
  productListLoading: false,
};

export const getProductData = createAsyncThunk(
  "get/productData",
  async (data: FilterParams) => {
    const response = await useCallAPI({
      method: "GET",
      url: `${URL_API}/products`,
    });

    if (response?.success === false) {
      return response;
    }

    const list = Array.isArray(response) ? response : [];

    return {
      success: true,
      data: filterProducts(list, data),
    };
  },
);

const productListSlice = createSlice({
  name: "productList",
  initialState,
  reducers: {
    resetAllProductListData: () => initialState,
    resetProductTypeAll: (state) => {
      state.paginationProductTypeAll = null;
      state.hasFetchedPaginationProductTypeAll = false;
      state.hasMorePaginationProductTypeAll = true;
      state.currentPagePaginationProductTypeAll = 1;
    },
    resetProductTypeFastFood: (state) => {
      state.paginationProductTypeFastFood = null;
      state.hasFetchedPaginationProductTypeFastFood = false;
      state.hasMorePaginationProductTypeFastFood = true;
      state.currentPagePaginationProductTypeFastFood = 1;
    },
    resetProductTypeDrinks: (state) => {
      state.paginationProductTypeDrinks = null;
      state.hasFetchedPaginationProductTypeDrinks = false;
      state.hasMorePaginationProductTypeDrinks = true;
      state.currentPagePaginationProductTypeDrinks = 1;
    },
    resetProductTypeSnacks: (state) => {
      state.paginationProductTypeSnacks = null;
      state.hasFetchedPaginationProductTypeSnacks = false;
      state.hasMorePaginationProductTypeSnacks = true;
      state.currentPagePaginationProductTypeSnacks = 1;
    },
    resetProductListStatus: (state) => {
      state.productListError = null;
      state.productListLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProductData.pending, (state) => {
        state.productListLoading = true;
        state.productListError = null;
      })
      .addCase(getProductData.fulfilled, (state, action) => {
        state.productListLoading = false;

        const { type } = action.meta.arg || {};
        const payloadData = Array.isArray(action.payload?.data) ? action.payload.data : [];

        if (!action.payload?.success) {
          state.productListError = action.payload?.message || "Failed to fetch products";
          return;
        }

        if (type === "all") {
          state.hasMorePaginationProductTypeAll = payloadData.length >= 10;
          state.paginationProductTypeAll = state.paginationProductTypeAll
            ? [...state.paginationProductTypeAll, ...payloadData]
            : payloadData;
          state.currentPagePaginationProductTypeAll += 1;
          state.hasFetchedPaginationProductTypeAll = true;
        } else if (type === "snacks") {
          state.hasMorePaginationProductTypeSnacks = payloadData.length >= 10;
          state.paginationProductTypeSnacks = state.paginationProductTypeSnacks
            ? [...state.paginationProductTypeSnacks, ...payloadData]
            : payloadData;
          state.currentPagePaginationProductTypeSnacks += 1;
          state.hasFetchedPaginationProductTypeSnacks = true;
        } else if (type === "fast_food") {
          state.hasMorePaginationProductTypeFastFood = payloadData.length >= 10;
          state.paginationProductTypeFastFood = state.paginationProductTypeFastFood
            ? [...state.paginationProductTypeFastFood, ...payloadData]
            : payloadData;
          state.currentPagePaginationProductTypeFastFood += 1;
          state.hasFetchedPaginationProductTypeFastFood = true;
        } else if (type === "drinks") {
          state.hasMorePaginationProductTypeDrinks = payloadData.length >= 10;
          state.paginationProductTypeDrinks = state.paginationProductTypeDrinks
            ? [...state.paginationProductTypeDrinks, ...payloadData]
            : payloadData;
          state.currentPagePaginationProductTypeDrinks += 1;
          state.hasFetchedPaginationProductTypeDrinks = true;
        }
      })
      .addCase(getProductData.rejected, (state, action: PayloadAction<any>) => {
        state.productListLoading = false;
        state.productListError = action.payload || "Failed to fetch products";
      });
  },
});

export const {
  resetAllProductListData,
  resetProductListStatus,
  resetProductTypeAll,
  resetProductTypeDrinks,
  resetProductTypeFastFood,
  resetProductTypeSnacks,
} = productListSlice.actions;

export default productListSlice.reducer;
