import showToastApp from "@app-components/CustomToast/ShowToastApp";
import axios, { AxiosRequestConfig } from "axios";

const defaultHeaderApplicationJson = { "Content-Type": "application/json" };
const defaultHeadersFormData = { "Content-Type": "multipart/form-data" };

type TypeHeaders = "application/json" | "multipart/form-data";
type Method = "GET" | "POST" | "PUT" | "DELETE";

type UseCallAPIProps = {
  method: Method;
  url: string;
  showToast?: boolean;
  token?: any;
  data?: any;
  typeHeaders?: TypeHeaders;
  config?: AxiosRequestConfig;
  successTitle?: string;
};

const buildErrorResponse = (error: any) => ({
  success: false,
  message: error?.response?.data?.message || error?.message || "Request failed",
  status: error?.response?.status ?? null,
  error: error?.response?.data || error,
});

const useCallAPI = async ({
  method,
  url,
  showToast = false,
  token,
  data,
  typeHeaders = "application/json",
  config,
  successTitle,
}: UseCallAPIProps): Promise<any> => {
  const defaultHeaders =
    typeHeaders === "application/json"
      ? defaultHeaderApplicationJson
      : defaultHeadersFormData;

  try {
    const response = await axios({
      method,
      url,
      headers: {
        ...defaultHeaders,
        ...config?.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      data,
      ...config,
    });

    if (response?.data && showToast) {
      showToastApp({
        type: "success",
        title: successTitle || "Thành công!",
      });
    }

    // Nếu backend trả về { status, data: [...] } thì bóc luôn lõi ra
    return response?.data?.data || response?.data;
  } catch (error: any) {
    console.log(`Error with ${method} request to ${url}:`, error);

    if (showToast) {
      const status = error?.response?.status;

      showToastApp({
        type: "error",
        title:
          status >= 500
            ? "Có lỗi hệ thống xảy ra!"
            : status >= 400
              ? "Yêu cầu không hợp lệ!"
              : "Có lỗi xảy ra!",
      });
    }

    return buildErrorResponse(error);
  }
};

export default useCallAPI;
