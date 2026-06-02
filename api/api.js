// api/api.js
import axios from "axios";
import { getToken } from "../storage/token";

const API = axios.create({
  // Dùng 10.0.2.2 cho máy ảo Android, hoặc IP LAN (VD: 192.168.1.x) nếu chạy trên máy thật
  baseURL: "http://172.20.10.2:4000",
});

// Interceptor: Tự động nhét Token vào mọi API gửi đi
API.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
