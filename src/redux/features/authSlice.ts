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
};

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
    user_name: response.user.name,
    email: response.user.email,
    role: response.user.role,
    token: response.access_token,
    refresh_token: response.refresh_token,
    user_avatar: "",
    password,
    user: response.user,
  };
};

const persistAuthData = async (payload: any) => {
  const accountData: AccountData & { password?: string } = {
    user_name: payload?.user_name,
    email: payload?.email,
    role: payload?.role,
    password: payload?.password,
  };

  await saveObjectDataToStorage(
    KEY_STORAGE.ACCOUNT_DATA,
    accountData,
  );

  await saveObjectDataToStorage(
    KEY_STORAGE.USER_TOKEN,
    payload?.token,
  );
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
    const response = await useCallAPI({
      method: "POST",
      url: `${URL_API}/auth/register`,
      data: {
        name: data.user_name,
        email: data.email,
        password: data.password,
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

    hydrateAuth: (
      state,
      action: PayloadAction<{
        account: AccountData | null;
        token: string | null;
      }>,
    ) => {
      state.account = action.payload.account;
      state.tokenData = action.payload.token;
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

      // LOGIN
      .addCase(loginAccount.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })

      .addCase(loginAccount.fulfilled, (state, action) => {
        state.authLoading = false;
        state.loginResponse = action.payload;

        if (action.payload?.success) {
          const payload: any = action.payload;

          state.account = {
            user_name: payload.user_name,
            email: payload.email,
            role: payload.role,
          };

          state.tokenData = payload.token;
        }

        if (!action.payload?.success) {
          state.authError =
            action.payload?.message || "Login failed";
        }
      })

      .addCase(loginAccount.rejected, (state, action) => {
        state.authLoading = false;
        state.authError =
          action.error.message || "Login failed";
      })

      // REGISTER
      .addCase(registerAccount.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })

      .addCase(registerAccount.fulfilled, (state, action) => {
        state.authLoading = false;
        state.registerResponse = action.payload;

        if (!action.payload?.success) {
          state.authError =
            action.payload?.message || "Register failed";
        }
      })

      .addCase(registerAccount.rejected, (state, action) => {
        state.authLoading = false;
        state.authError =
          action.error.message || "Register failed";
      });
  },
});

export const {
  resetLoginResponse,
  resetRegisterResponse,
  hydrateAuth,
  resetAllAuth,
} = authSlice.actions;

export default authSlice.reducer;