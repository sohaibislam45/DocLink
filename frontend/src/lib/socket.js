import { io } from "socket.io-client";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket) {
    console.log("Socket already exists, disconnecting old one...");
    socket.disconnect();
  }

  console.log("Initializing socket with token...");
  socket = io(BASE, {
    auth: { token },           // Firebase ID token sent on handshake
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    // console.log("Socket connected:", socket.id);
    console.log("Socket connected:");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};
