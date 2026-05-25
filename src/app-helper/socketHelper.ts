// src/app-helper/socketHelper.ts
import { io, Socket } from "socket.io-client";
import URL_API from "./urlAPI";

// Cắt đuôi /api nếu URL_API của sếp có, vì Socket cần kết nối vào gốc domain
const SOCKET_URL = URL_API.replace(/\/api$/, "");

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // Tắt tự động nối, mình sẽ tự bật khi User Login
  transports: ["websocket"], // Ép dùng Websocket cho mượt, không dùng Polling
});

export default socket;
