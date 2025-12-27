import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const API_URL = "https://api.escapemaster.es";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      router.replace("/login");
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.access_token) {
      await SecureStore.setItemAsync("token", response.data.access_token);
    }
    return response.data;
  },
  register: async (
    name: string,
    email: string,
    password: string,
    organizationName?: string,
    invitationCode?: string
  ) => {
    const response = await api.post("/auth/register", {
      full_name: name,
      email,
      password,
      organization_name: organizationName,
      invitation_code: invitationCode,
    });
    return response.data;
  },
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    router.replace("/login");
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  },
};

export const rooms = {
  list: async (params?: any) => {
    const response = await api.get("/rooms", { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/rooms", data);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
};

export const bookings = {
  list: async (params?: any) => {
    const response = await api.get("/bookings", { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/bookings", data);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
};

export const stats = {
  getSummary: async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },
  getStats: async (period: string = "month") => {
    const response = await api.get("/dashboard/stats", { params: { period } });
    return response.data;
  },
  getRevenue: async (period: string = "month") => {
    const response = await api.get("/dashboard/revenue", { params: { period } });
    return response.data;
  },
};

export default api;
