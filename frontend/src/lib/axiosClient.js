import axios from "axios";
import { auth } from "./firebase.js";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");

// Shared Axios instance — all API modules import this
const axiosClient = axios.create({
  baseURL: `${BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: automatically attach Firebase Auth JWT on every request
axiosClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize errors so TanStack Query catches them cleanly
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
