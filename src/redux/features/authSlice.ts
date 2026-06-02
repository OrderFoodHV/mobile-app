import URL_API from "@app-helper/urlAPI";
import useCallAPI from "@app-helper/useCallAPI";
import { saveObjectDataToStorage, saveStringDataToStorage } from "@app-helper/useSaveDataToStorage";
import {
  AccountData,
  AuthProps,
  LoginSendData,
  RegisterSendData,
} from "@app-schemas/Auth/auth";
import { KEY_STORAGE } from "@app-services/service-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthProps = {
  loginResponse: null,
  registerResponse: null,
  account: null,
  tokenData: null,
  authError: null,
  authLoading: false,
} as any;

const mapLoginResponse = (response: any, password?: string) => {
  if (!response?.access_token || !response?.user) {
    return {
      success: false,
      message: response?.message || "Login failed",
    };
  }

  return {
    success: true,
    message: response?.message || "Login success",
    user_name: response.user.user_name || response.user.name,
    email: response.user.email,
    role: response.user.role,
    phone: response.user.phone,
    is_shipper: response.user.is_shipper || 0, // Đón cờ shipper
    is_seller: response.user.is_seller || 0, // Đón cờ seller
    token: response.access_token,
    refresh_token: response.refresh_token,
    user_avatar: response.user.avatar || "",
    password,
    user: response.user,
  };
};

const persistAuthData = async (payload: any) => {
  const accountData: any = {
    user_name: payload?.user_name,
    email: payload?.email,
    role: payload?.role,
    phone: payload?.phone,
    is_shipper: payload?.is_shipper, 
    is_seller: payload?.is_seller, 
    storeId: payload.user?.storeId,
    storeName: payload.user?.storeName,
    storeAddress: payload.user?.storeAddress,
    storePhone: payload.user?.storePhone,
    storeStatus: payload.user?.storeStatus,
    shipperStatus: payload.user?.shipperStatus,
    vehicle: payload.user?.vehicle,
    shipperPhone: payload.user?.shipperPhone,
    license_plate: payload.user?.license_plate,
    avatar: payload.user?.avatar,
    password: payload?.password,
    shipperRating: payload.user?.shipperRating,
    shipperRatingCount: payload.user?.shipperRatingCount,
    storeRating: payload.user?.storeRating,
    storeRatingCount: payload.user?.storeRatingCount,
  };

  await saveObjectDataToStorage(KEY_STORAGE.ACCOUNT_DATA, accountData);
  await saveStringDataToStorage(KEY_STORAGE.USER_TOKEN, payload?.token);
};

export const loginAccount = createAsyncThunk(
  "post/loginAccount",
  async (data: LoginSendData) => {
    const response = await useCallAPI({
      method: "POST",
      url: `${URL_API}/auth/login`,
      data,
      showToast: false,
    });

    const mapped = mapLoginResponse(response, data.password);

    if (mapped.success) {
      await persistAuthData(mapped);
    }

    return mapped;
  },
);

export const registerAccount = createAsyncThunk(
  "post/registerAccount",
  async (data: RegisterSendData) => {
    const safeData = data as any;

    const response = await useCallAPI({
      method: "POST",
      url: `${URL_API}/auth/register`,
      data: {
        name: safeData.name || safeData.user_name,
        email: safeData.email,
        password: safeData.password,
        phone: safeData.phone,
      },
      showToast: false,
    });

    if (response && response.success === false) {
      return {
        success: false,
        message: response.message || "Đăng ký thất bại",
      };
    }

    return {
      success: true,
      message: "Tạo tài khoản thành công!",
    };
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetLoginResponse: (state) => {
      state.loginResponse = null;
      state.authError = null;
      state.authLoading = false;
    },

    resetRegisterResponse: (state) => {
      state.registerResponse = null;
      state.authError = null;
      state.authLoading = false;
    },

    updateAuthInfor: (state: any, action: PayloadAction<any>) => {
      if (state.account) {
        state.account = {
          ...state.account, // Giữ nguyên các data cũ
          // Cập nhật đè dữ liệu mới nếu có truyền vào
          user_name: action.payload.user_name || state.account.user_name,
          name: action.payload.name || state.account.name, // Thêm dòng này để phòng bạn dùng chữ 'name'
          phone: action.payload.phone || state.account.phone,
          is_shipper: action.payload.is_shipper !== undefined ? action.payload.is_shipper : state.account.is_shipper,
          is_seller: action.payload.is_seller !== undefined ? action.payload.is_seller : state.account.is_seller,
          storeId: action.payload.storeId !== undefined ? action.payload.storeId : state.account.storeId,
          storeName: action.payload.storeName !== undefined ? action.payload.storeName : state.account.storeName,
          storeAddress:
            action.payload.storeAddress !== undefined ? action.payload.storeAddress : state.account.storeAddress,
          storePhone:
            action.payload.storePhone !== undefined ? action.payload.storePhone : state.account.storePhone,
          storeStatus: action.payload.storeStatus !== undefined ? action.payload.storeStatus : state.account.storeStatus,
          shipperStatus: action.payload.shipperStatus !== undefined ? action.payload.shipperStatus : state.account.shipperStatus,

          address: action.payload.address || state.account.address, // Dành cho Store
          vehicle: action.payload.vehicle !== undefined ? action.payload.vehicle : state.account.vehicle, // Dành cho Shipper
          license_plate:
            action.payload.license_plate !== undefined ? action.payload.license_plate : state.account.license_plate, // Shipper
          shipperPhone:
            action.payload.shipperPhone !== undefined ? action.payload.shipperPhone : state.account.shipperPhone, // Shipper
          avatar: action.payload.avatar || state.account.avatar, // Ảnh đại diện dùng chung
          shipperRating:
            action.payload.shipperRating !== undefined ? action.payload.shipperRating : state.account.shipperRating,
          shipperRatingCount:
            action.payload.shipperRatingCount !== undefined ? action.payload.shipperRatingCount : state.account.shipperRatingCount,
          storeRating:
            action.payload.storeRating !== undefined ? action.payload.storeRating : state.account.storeRating,
          storeRatingCount:
            action.payload.storeRatingCount !== undefined ? action.payload.storeRatingCount : state.account.storeRatingCount,
        };
      }

      if (state.user) {
        state.user = {
          ...state.user,
          name: action.payload.name || state.user.name,
          phone: action.payload.phone || state.user.phone,
          is_shipper: action.payload.is_shipper !== undefined ? action.payload.is_shipper : state.user.is_shipper,
          is_seller: action.payload.is_seller !== undefined ? action.payload.is_seller : state.user.is_seller,
          storeId: action.payload.storeId !== undefined ? action.payload.storeId : state.user.storeId,
          storeName: action.payload.storeName !== undefined ? action.payload.storeName : state.user.storeName,
          storeAddress:
            action.payload.storeAddress !== undefined ? action.payload.storeAddress : state.user.storeAddress,
          storePhone:
            action.payload.storePhone !== undefined ? action.payload.storePhone : state.user.storePhone,
          storeStatus: action.payload.storeStatus !== undefined ? action.payload.storeStatus : state.user.storeStatus,
          shipperStatus: action.payload.shipperStatus !== undefined ? action.payload.shipperStatus : state.user.shipperStatus,
          vehicle: action.payload.vehicle !== undefined ? action.payload.vehicle : state.user.vehicle,
          shipperPhone: action.payload.shipperPhone !== undefined ? action.payload.shipperPhone : state.user.shipperPhone,
          license_plate: action.payload.license_plate !== undefined ? action.payload.license_plate : state.user.license_plate,
          shipperRating: action.payload.shipperRating !== undefined ? action.payload.shipperRating : state.user.shipperRating,
          shipperRatingCount: action.payload.shipperRatingCount !== undefined ? action.payload.shipperRatingCount : state.user.shipperRatingCount,
          storeRating: action.payload.storeRating !== undefined ? action.payload.storeRating : state.user.storeRating,
          storeRatingCount: action.payload.storeRatingCount !== undefined ? action.payload.storeRatingCount : state.user.storeRatingCount,
        };
      }

      if (state.account) {
        saveObjectDataToStorage(KEY_STORAGE.ACCOUNT_DATA, state.account).catch(
          (err) => console.log("Lỗi lưu AccountData:", err),
        );
      }
    },

    hydrateAuth: (
      state: any,
      action: PayloadAction<{
        account: AccountData | null;
        token: string | null;
      }>,
    ) => {
      state.tokenData = action.payload.token;

      if (action.payload.account) {
        const localAccount = action.payload.account as any;

        state.account = {
          user_name: localAccount.user_name,
          email: localAccount.email,
          role: localAccount.role,
          phone: localAccount.phone || "0123456789",
          is_shipper: localAccount.is_shipper || 0, // 🔥 PHỤC HỒI CỜ SHIPPER TỪ BỘ NHỚ
          is_seller: localAccount.is_seller || 0, // 🔥 PHỤC HỒI CỜ SELLER TỪ BỘ NHỚ
          storeId: localAccount.storeId || null,
          storeName: localAccount.storeName || null,
          storeAddress: localAccount.storeAddress || null,
          storePhone: localAccount.storePhone || null,
          storeStatus: localAccount.storeStatus || null,
          shipperStatus: localAccount.shipperStatus || null,
          vehicle: localAccount.vehicle || null,
          shipperPhone: localAccount.shipperPhone || null,
          license_plate: localAccount.license_plate || null,
          avatar: localAccount.avatar || null,
          shipperRating: localAccount.shipperRating || null,
          shipperRatingCount: localAccount.shipperRatingCount || null,
          storeRating: localAccount.storeRating || null,
          storeRatingCount: localAccount.storeRatingCount || null,
        };
      } else {
        state.account = null;
      }
    },

    resetAllAuth: (state) => {
      state.loginResponse = null;
      state.registerResponse = null;
      state.account = null;
      state.tokenData = null;
      state.authError = null;
      state.authLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginAccount.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })

      .addCase(loginAccount.fulfilled, (state: any, action) => {
        state.authLoading = false;
        state.loginResponse = action.payload;

        if (action.payload?.success) {
          const payload: any = action.payload;
          state.user = payload.user;

          state.account = {
            user_name: payload.user_name,
            email: payload.email,
            role: payload.role,
            phone: payload.phone || "0123456789",
            is_shipper: payload.is_shipper || 0, 
            is_seller: payload.is_seller || 0, 
            storeId: payload.user?.storeId || null,
            storeName: payload.user?.storeName || null,
            storeAddress: payload.user?.storeAddress || null,
            storeStatus: payload.user?.storeStatus || null,
            shipperStatus: payload.user?.shipperStatus || null,
            vehicle: payload.user?.vehicle || null,
            shipperPhone: payload.user?.shipperPhone || null,
            license_plate: payload.user?.license_plate || null,
            avatar: payload.user?.avatar || null,
            shipperRating: payload.user?.shipperRating || null,
            shipperRatingCount: payload.user?.shipperRatingCount || null,
            storeRating: payload.user?.storeRating || null,
            storeRatingCount: payload.user?.storeRatingCount || null,
          };

          state.tokenData = payload.token;
        }

        if (!action.payload?.success) {
          state.authError = action.payload?.message || "Login failed";
        }
      })

      .addCase(loginAccount.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.error.message || "Login failed";
      })

      .addCase(registerAccount.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })

      .addCase(registerAccount.fulfilled, (state, action) => {
        state.authLoading = false;
        state.registerResponse = action.payload;

        if (!action.payload?.success) {
          state.authError = action.payload?.message || "Register failed";
        }
      })

      .addCase(registerAccount.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.error.message || "Register failed";
      });
  },
});

export const {
  resetLoginResponse,
  resetRegisterResponse,
  hydrateAuth,
  resetAllAuth,
  updateAuthInfor,
} = authSlice.actions;

export default authSlice.reducer;
