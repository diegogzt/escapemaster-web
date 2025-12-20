import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Also remove cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        
        // Only redirect if not already on login/register
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string, organizationName: string) => {
    const response = await api.post("/auth/register", {
      full_name: name,
      email,
      password,
      organization_name: organizationName,
    });
    return response.data;
  },
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  updateMe: async (data: any) => {
    const response = await api.put("/auth/me", data);
    return response.data;
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

export const orgs = {
  create: async (data: any) => {
    const response = await api.post("/organizations", data);
    return response.data;
  },
  join: async (code: string) => {
    const response = await api.post("/organizations/join", { code });
    return response.data;
  },
  invite: async (orgId: string, email: string) => {
    const response = await api.post(`/organizations/${orgId}/invite`, {
      email,
    });
    return response.data;
  },
};

export const dashboard = {
  getStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default stats structure to prevent UI crash
      return {
        monthly_revenue: 0,
        total_bookings: 0,
        active_users: 0,
      };
    }
  },
};

export const rooms = {
  list: async () => {
    try {
      const response = await api.get("/rooms");
      return response.data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  },
  create: async (data: any) => {
    const response = await api.post("/rooms", data);
    return response.data;
  },
};

export const users = {
  list: async () => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },
  create: async (data: any) => {
    const response = await api.post("/users", data);
    return response.data;
  },
};

export const bookings = {
  list: async () => {
    try {
      const response = await api.get("/bookings");
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  },
  create: async (data: any) => {
    const response = await api.post("/bookings", data);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },
};

export const admin = {
  login: async (data: any) => {
    const response = await api.post("/admin/login", data);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
  getOrganizations: async () => {
    const response = await api.get("/admin/organizations");
    return response.data;
  },
  getOrgUsers: async (orgId: string) => {
    const response = await api.get(`/admin/organizations/${orgId}/users`);
    return response.data;
  },
};

export default api;
