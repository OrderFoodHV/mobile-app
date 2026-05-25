import URL_API from "@app-helper/urlAPI";
import useCallAPI from "@app-helper/useCallAPI";
import { saveObjectDataToStorage } from "@app-helper/useSaveDataToStorage";
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
    user_avatar: "",
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
    is_shipper: payload?.is_shipper, // Nhớ lưu xuống bộ nhớ
    is_seller: payload?.is_seller, // Nhớ lưu xuống bộ nhớ
    password: payload?.password,
  };

  await saveObjectDataToStorage(KEY_STORAGE.ACCOUNT_DATA, accountData);
  await saveObjectDataToStorage(KEY_STORAGE.USER_TOKEN, payload?.token);
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

    return {
      success: response?.success,
      message: response?.message || "Register failed",
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
          name: action.payload.name || state.account.name, // Thêm dòng này để phòng sếp dùng chữ 'name'
          phone: action.payload.phone || state.account.phone,
          is_shipper: action.payload.is_shipper ?? state.account.is_shipper,
          is_seller: action.payload.is_seller ?? state.account.is_seller,

          address: action.payload.address || state.account.address, // Dành cho Store
          vehicle: action.payload.vehicle || state.account.vehicle, // Dành cho Shipper
          license_plate:
            action.payload.license_plate || state.account.license_plate, // Shipper
          avatar: action.payload.avatar || state.account.avatar, // Ảnh đại diện dùng chung
        };
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
            is_shipper: payload.is_shipper || 0, // 🔥 LƯU VÀO STATE SAU KHI LOGIN
            is_seller: payload.is_seller || 0, // 🔥 LƯU VÀO STATE SAU KHI LOGIN
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
