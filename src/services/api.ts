import axios from "axios";

const API_URL = "/api";

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
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

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
  register: async (
    name: string,
    email: string,
    password: string,
    organizationName: string
  ) => {
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
  sendVerificationCode: async (email: string) => {
    const response = await api.post("/auth/send-verification-code", { email });
    return response.data;
  },
  verifyEmailCode: async (email: string, code: string) => {
    const response = await api.post("/auth/verify-email-code", { email, code });
    return response.data;
  },
  onboard: async (data: { email: string; invitation_code: string; password: string }) => {
    const response = await api.post("/auth/onboard", data);
    return response.data;
  },
  joinOrganization: async (invitationCode: string) => {
    const response = await api.post("/auth/join-organization", { invitation_code: invitationCode });
    return response.data;
  },
  getMemberships: async () => {
    const response = await api.get("/auth/memberships");
    return response.data;
  },
  switchOrganization: async (organizationId: string) => {
    const response = await api.post("/auth/switch-organization", { organization_id: organizationId });
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
  getStats: async (period: string = "month") => {
    try {
      const response = await api.get("/dashboard/stats", { params: { period } });
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error; // Propagate error to let UI handle it, instead of returning incomplete data
    }
  },
  getSummary: async () => {
    try {
      const response = await api.get("/dashboard/summary");
      return response.data;
    } catch (error) {
       console.error("Error fetching dashboard summary:", error);
       throw error;
    }
  },
  getRevenue: async (period: string = "month") => {
    try {
      const response = await api.get("/dashboard/revenue", { params: { period } });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw error;
    }
  },
  getBookingsChart: async (period: string = "month") => {
     try {
      const response = await api.get("/dashboard/bookings-chart", { params: { period } });
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings chart:", error);
      throw error;
    }
  }
};

export const bookings = {
  list: async (params?: any) => {
    try {
      const response = await api.get("/bookings", { params });
      // Return full response to allow access to pagination metadata (total, page, total_pages)
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error; // Don't swallow errors!
    }
  },
  create: async (data: any) => {
    const response = await api.post("/bookings", data);
    return response.data;
  },
  get: async (id: string) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching booking:", error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },
};

export const timeclock = {
  checkIn: async (data: { check_in_time?: string; task_description?: string }) => {
    const response = await api.post("/timeclock/check-in", data);
    return response.data;
  },
  checkOut: async (data: { check_out_time?: string; task_description?: string }) => {
    const response = await api.post("/timeclock/check-out", data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/timeclock/me");
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get("/timeclock/summary");
    return response.data;
  },
  getAll: async (params?: { user_id?: string; limit?: number }) => {
    const response = await api.get("/timeclock/admin/all", { params });
    return response.data;
  },
};

export const vacations = {
  request: async (data: { start_date: string; end_date: string; user_notes?: string }) => {
    const response = await api.post("/vacations", data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/vacations/me");
    return response.data;
  },
  getAll: async (params?: { user_id?: string; status?: string }) => {
    const response = await api.get("/vacations/admin/all", { params });
    return response.data;
  },
  updateStatus: async (id: string, data: { status: string; admin_notes?: string }) => {
    const response = await api.put(`/vacations/${id}`, data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/vacations/${id}`, data);
    return response.data;
  },
};

export interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  capacity_min: number;
  price_per_person: number;
  duration_minutes: number;
  difficulty_level: number;
  theme?: string;
  image_url?: string;
  color?: string;
  status_colors?: Record<string, string>;
  is_active: boolean;
}

export const rooms = {
  list: async (params?: any) => {
    try {
      const response = await api.get("/rooms", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },
  create: async (data: any) => {
    const response = await api.post("/rooms", data);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};

export const users = {
  list: async (params?: any) => {
    try {
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
  get: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/users", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const emailTemplates = {
  list: async () => {
    const response = await api.get("/email-templates");
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/email-templates/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/email-templates", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/email-templates/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/email-templates/${id}`);
    return response.data;
  },
};

export interface WidgetDefinition {
  id: string;
  name: string;
  slug: string;
  description?: string;
  component_path: string;
  default_config: any;
  min_col_span: number;
  min_row_span: number;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description?: string;
  layout: any;
  is_default: boolean;
}

export interface UserWidgetCollection {
  id: string;
  name: string;
  description?: string;
  layout: any;
  is_active: boolean;
}

export const widgets = {
  getWidgetDefinitions: async () => {
    const response = await api.get("/widgets/definitions");
    return response.data;
  },
  updateDefinition: async (id: string, data: any) => {
    const response = await api.put(`/widgets/definitions/${id}`, data);
    return response.data;
  },
  getTemplates: async () => {
    const response = await api.get("/widgets/templates");
    return response.data;
  },
  getCollections: async () => {
    const response = await api.get("/widgets/collections");
    return response.data;
  },
  createCollection: async (data: any) => {
    const response = await api.post("/widgets/collections", data);
    return response.data;
  },
  updateCollection: async (id: string, data: any) => {
    const response = await api.put(`/widgets/collections/${id}`, data);
    return response.data;
  },
  deleteCollection: async (id: string) => {
    const response = await api.delete(`/widgets/collections/${id}`);
    return response.data;
  },
  activateCollection: async (id: string) => {
    const response = await api.post(`/widgets/collections/${id}/activate`);
    return response.data;
  },
  getRevenueSummary: async (period: string = "month") => {
    const response = await api.get("/dashboard/stats", { params: { period } });
    return response.data;
  },
};

export const reports = {
  getRevenue: async (params?: any) => {
    const response = await api.get("/reports/revenue", { params });
    return response.data;
  },
  getBookings: async (params?: any) => {
    const response = await api.get("/reports/bookings", { params });
    return response.data;
  },
};

export const roles = {
  list: async () => {
    try {
      const response = await api.get("/roles");
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },
  get: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/roles", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/roles/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
  listPermissions: async () => {
    const response = await api.get("/roles/permissions");
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
