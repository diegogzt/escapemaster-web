import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://my.escapemaster.es/api/v1";

console.log(`%c[API] Base URL: ${API_URL}`, "color: #00bcd4; font-weight: bold");

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout (remote Supabase can be slow)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token AND log every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach timestamp for duration measurement
    (config as any).__startTime = Date.now();
    const method = (config.method || "GET").toUpperCase();
    const url = `${config.baseURL || ""}${config.url || ""}`;
    const params = config.params ? `?${new URLSearchParams(config.params).toString()}` : "";
    console.log(
      `%c[API] ➡️ ${method} ${config.url}${params}`,
      "color: #2196f3; font-weight: bold",
      {
        fullUrl: `${url}${params}`,
        hasToken: !!token,
        data: config.data || null,
      }
    );
    return config;
  },
  (error) => {
    console.error(`%c[API] ❌ Request setup error`, "color: #f44336; font-weight: bold", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses AND handle auth errors
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - ((response.config as any).__startTime || Date.now());
    const dataSize = JSON.stringify(response.data || {}).length;
    const method = (response.config.method || "GET").toUpperCase();
    console.log(
      `%c[API] ✅ ${method} ${response.config.url} — ${response.status} (${duration}ms, ${dataSize} bytes)`,
      "color: #4caf50; font-weight: bold",
      {
        status: response.status,
        duration: `${duration}ms`,
        dataKeys: response.data && typeof response.data === "object"
          ? Object.keys(response.data)
          : typeof response.data,
        data: response.data,
      }
    );
    return response;
  },
  (error) => {
    const config = error.config || {};
    const duration = Date.now() - ((config as any).__startTime || Date.now());
    const method = (config.method || "GET").toUpperCase();
    const status = error.response?.status || "TIMEOUT/NETWORK";
    const responseData = error.response?.data || null;

    console.error(
      `%c[API] ❌ ${method} ${config.url} — ${status} (${duration}ms)`,
      "color: #f44336; font-weight: bold",
      {
        status,
        duration: `${duration}ms`,
        code: error.code,
        message: error.message,
        responseData,
        requestParams: config.params || null,
        requestData: config.data || null,
      }
    );

    if (error.response?.status === 401) {
      console.warn(`%c[API] 🔒 401 Unauthorized — clearing token`, "color: #ff9800; font-weight: bold");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
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
    organizationName: string,
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
  onboard: async (data: {
    email: string;
    invitation_code: string;
    password: string;
  }) => {
    const response = await api.post("/auth/onboard", data);
    return response.data;
  },
  joinOrganization: async (invitationCode: string) => {
    const response = await api.post("/auth/join-organization", {
      invitation_code: invitationCode,
    });
    return response.data;
  },
  getMemberships: async () => {
    const response = await api.get("/auth/memberships");
    return response.data;
  },
  switchOrganization: async (organizationId: string) => {
    const response = await api.post("/auth/switch-organization", {
      organization_id: organizationId,
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
  getStats: async (period: string = "month") => {
    try {
      const response = await api.get("/dashboard/stats", {
        params: { period },
      });
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
      const response = await api.get("/dashboard/revenue", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw error;
    }
  },
  getBookingsChart: async (period: string = "month") => {
    try {
      const response = await api.get("/dashboard/bookings-chart", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings chart:", error);
      throw error;
    }
  },
  blockHours: async (data: {
    start_time: string;
    end_time: string;
    date: string;
    room_id?: string;
    reason?: string;
    recurrence?: string;
    end_recurrence?: string;
  }) => {
    const response = await api.post("/dashboard/block-hours", data);
    return response.data;
  },
  getCalendarStatus: async (month: number, year: number) => {
    const response = await api.get("/dashboard/calendar-status", {
      params: { month, year },
    });
    return response.data;
  },
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
  delete: async (id: string) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
  updateStatus: async (
    id: string,
    data: { booking_status: string; block_reason?: string },
  ) => {
    const response = await api.put(`/bookings/${id}/status`, data);
    return response.data;
  },
  assignMembers: async (id: string, userIds: string[]) => {
    const response = await api.post(`/bookings/${id}/assign-members`, {
      user_ids: userIds,
    });
    return response.data;
  },
  claim: async (id: string) => {
    const response = await api.post(`/bookings/${id}/claim`);
    return response.data;
  },
  confirm: async (id: string) => {
    const response = await api.post(`/bookings/${id}/confirm`);
    return response.data;
  },
  finalize: async (
    id: string,
    data: { notes?: string; rating?: number; send_email?: boolean },
  ) => {
    const response = await api.post(`/bookings/${id}/finalize`, data);
    return response.data;
  },
  signGDPR: async (
    id: string,
    data: {
      customer_email: string;
      signature_data: string;
      ip_address?: string;
      guest_id: string;
    },
  ) => {
    const response = await api.post(`/bookings/${id}/gdpr`, data);
    return response.data;
  },
  getInvoice: async (id: string) => {
    const response = await api.get(`/bookings/${id}/invoice`);
    return response.data;
  },
  registerPayment: async (
    id: string,
    data: { amount: number; payment_method: string; notes?: string },
  ) => {
    const response = await api.post(`/bookings/${id}/payment`, data);
    return response.data;
  },
};

export const timeclock = {
  checkIn: async (data: {
    check_in_time?: string;
    task_description?: string;
  }) => {
    const response = await api.post("/timeclock/check-in", data);
    return response.data;
  },
  checkOut: async (data: {
    check_out_time?: string;
    task_description?: string;
  }) => {
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
  request: async (data: {
    start_date: string;
    end_date: string;
    user_notes?: string;
  }) => {
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
  updateStatus: async (
    id: string,
    data: { status: string; admin_notes?: string },
  ) => {
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
  getDeletionImpact: async (id: string) => {
    const response = await api.get(`/rooms/${id}/deletion-impact`);
    return response.data;
  },
  deactivate: async (id: string) => {
    const response = await api.post(`/rooms/${id}/deactivate`);
    return response.data;
  },
  getAvailability: async (id: string, checkDate: string, numPeople: number) => {
    const response = await api.get(`/rooms/${id}/availability`, {
      params: { check_date: checkDate, num_people: numPeople },
    });
    return response.data;
  },
  createSchedule: async (id: string, data: any) => {
    const response = await api.post(`/rooms/${id}/schedules`, data);
    return response.data;
  },
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/rooms/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getNotificationSettings: async (id: string) => {
    const response = await api.get(`/rooms/${id}/notification-settings`);
    return response.data;
  },
  updateNotificationSettings: async (id: string, data: any) => {
    const response = await api.put(`/rooms/${id}/notification-settings`, data);
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
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    const response = await api.put("/users/me/password", data);
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
  default_col_span?: number;
  default_row_span?: number;
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

export const payments = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      const response = await api.get("/payments", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },
  get: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  create: async (data: {
    booking_id: string;
    amount?: number;
    payment_method: string;
    stripe_payment_intent_id?: string;
    notes?: string;
  }) => {
    const response = await api.post("/payments", data);
    return response.data;
  },
  createCheckoutSession: async (data: {
    booking_id: string;
    success_url: string;
    cancel_url: string;
  }) => {
    const response = await api.post("/payments/checkout-session", data);
    return response.data;
  },
  refund: async (
    paymentId: string,
    data?: { amount?: number; reason?: string },
  ) => {
    const response = await api.post(
      `/payments/${paymentId}/refund`,
      data || {},
    );
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
  getOccupancy: async (params?: any) => {
    const response = await api.get("/reports/occupancy", { params });
    return response.data;
  },
  exportBookings: async (
    format: "csv" | "pdf" | "excel",
    startDate?: string,
    endDate?: string,
  ) => {
    const response = await api.get("/reports/bookings/export", {
      params: { format, start_date: startDate, end_date: endDate },
      responseType: "blob",
    });
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
    const response = await api.put(`/roles/${id}`, data);
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

// === GAME MASTER ===
export const gamemaster = {
  getToday: async (params?: { room_id?: string; date_from?: string; date_to?: string; status?: string | string[]; search?: string }) => {
    const response = await api.get("/gamemaster/today", {
      params: params || {},
    });
    return response.data;
  },
  checkIn: async (bookingId: string) => {
    const response = await api.post(`/gamemaster/check-in/${bookingId}`);
    return response.data;
  },
  getBooking: async (bookingId: string) => {
    const response = await api.get(`/gamemaster/booking/${bookingId}`);
    return response.data;
  },
  recordResult: async (
    bookingId: string,
    data: {
      escaped: boolean;
      escape_time_seconds?: number;
      hints_used: number;
      notes?: string;
    },
  ) => {
    const response = await api.post(
      `/gamemaster/booking/${bookingId}/result`,
      data,
    );
    return response.data;
  },
  getChecklist: async (roomId: string) => {
    const response = await api.get(`/gamemaster/rooms/${roomId}/checklist`);
    return response.data;
  },
  completeChecklistItem: async (bookingId: string, itemId: string) => {
    const response = await api.post(
      `/gamemaster/bookings/${bookingId}/checklist/${itemId}/complete`,
    );
    return response.data;
  },
};

// === COUPONS ===
export const coupons = {
  list: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
  }) => {
    const response = await api.get("/coupons", { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/coupons", data);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/coupons/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
  validate: async (data: {
    code: string;
    room_id?: string;
    booking_amount: number;
  }) => {
    const response = await api.post("/coupons/validate", data);
    return response.data;
  },
};

// === ROOM EXTRAS ===
export const roomExtras = {
  list: async (roomId: string) => {
    const response = await api.get(`/rooms/${roomId}/extras`);
    return response.data;
  },
  create: async (roomId: string, data: any) => {
    const response = await api.post(`/rooms/${roomId}/extras`, data);
    return response.data;
  },
  update: async (extraId: string, params: any) => {
    const response = await api.put(`/extras/${extraId}`, null, { params });
    return response.data;
  },
  delete: async (extraId: string) => {
    const response = await api.delete(`/extras/${extraId}`);
    return response.data;
  },
  getPricing: async (roomId: string) => {
    const response = await api.get(`/rooms/${roomId}/pricing`);
    return response.data;
  },
  createPricing: async (roomId: string, data: any) => {
    const response = await api.post(`/rooms/${roomId}/pricing`, data);
    return response.data;
  },
  deletePricing: async (pricingId: string) => {
    const response = await api.delete(`/pricing/${pricingId}`);
    return response.data;
  },
  getCancellationPolicy: async (roomId: string) => {
    const response = await api.get(`/rooms/${roomId}/cancellation-policy`);
    return response.data;
  },
  updateCancellationPolicy: async (roomId: string, data: any) => {
    const response = await api.put(
      `/rooms/${roomId}/cancellation-policy`,
      data,
    );
    return response.data;
  },
  addBookingExtra: async (
    bookingId: string,
    extraId: string,
    details?: string,
  ) => {
    const response = await api.post(`/bookings/${bookingId}/extras`, null, {
      params: { extra_id: extraId, details },
    });
    return response.data;
  },
  getBookingExtras: async (bookingId: string) => {
    const response = await api.get(`/bookings/${bookingId}/extras`);
    return response.data;
  },
};

// === SPLIT PAYMENT ===
export const splitPayment = {
  create: async (data: {
    booking_id: string;
    participant_emails: string[];
    split_type: string;
  }) => {
    const response = await api.post("/split-payment", data);
    return response.data;
  },
  join: async (shareCode: string) => {
    const response = await api.get(`/split-payment/join/${shareCode}`);
    return response.data;
  },
  get: async (lobbyId: string) => {
    const response = await api.get(`/split-payment/${lobbyId}`);
    return response.data;
  },
  pay: async (lobbyId: string, amount: number, paymentIntentId?: string) => {
    const response = await api.post(`/split-payment/${lobbyId}/pay`, null, {
      params: { amount, payment_intent_id: paymentIntentId },
    });
    return response.data;
  },
  updateAmounts: async (
    lobbyId: string,
    contributions: { email: string; amount: number }[],
  ) => {
    const response = await api.put(`/split-payment/${lobbyId}/amounts`, {
      contributions,
    });
    return response.data;
  },
  remind: async (lobbyId: string) => {
    const response = await api.post(`/split-payment/${lobbyId}/remind`);
    return response.data;
  },
  cancel: async (lobbyId: string) => {
    const response = await api.delete(`/split-payment/${lobbyId}`);
    return response.data;
  },
};

// === KYB ===
export const kyb = {
  getDocuments: async () => {
    const response = await api.get("/kyb/documents");
    return response.data;
  },
  uploadDocument: async (documentType: string, file: File) => {
    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("file", file);
    const response = await api.post("/kyb/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get("/kyb/status");
    return response.data;
  },
  getBankAccount: async () => {
    const response = await api.get("/kyb/bank-account");
    return response.data;
  },
  updateBankAccount: async (data: {
    iban: string;
    bic_swift?: string;
    bank_name: string;
    account_holder_name: string;
  }) => {
    const response = await api.post("/kyb/bank-account", data);
    return response.data;
  },
};

// === PAYOUTS ===
export const payouts = {
  list: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get("/payouts", { params });
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get("/payouts/summary");
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/payouts/${id}`);
    return response.data;
  },
  getInvoice: async (id: string) => {
    const response = await api.get(`/payouts/${id}/invoice`);
    return response.data;
  },
};

// === API KEYS ===
export const apiKeys = {
  list: async () => {
    const response = await api.get("/api-keys");
    return response.data;
  },
  create: async (data: { name: string; expires_at?: string }) => {
    const response = await api.post("/api-keys", data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api-keys/${id}`);
    return response.data;
  },
};

// === DEVELOPER (Projects & Keys) ===
export const developer = {
  getProjects: async () => {
    const response = await api.get("/developer/projects");
    return response.data;
  },
  createProject: async (data: { name: string; description?: string }) => {
    const response = await api.post("/developer/projects", data);
    return response.data;
  },
  deleteProject: async (id: string) => {
    const response = await api.delete(`/developer/projects/${id}`);
    return response.data;
  },
  getKeys: async (projectId: string) => {
    const response = await api.get(`/developer/projects/${projectId}/keys`);
    return response.data;
  },
  createKey: async (projectId: string, data: { name: string }) => {
    const response = await api.post(
      `/developer/projects/${projectId}/keys`,
      data,
    );
    return response.data;
  },
  revokeKey: async (projectId: string, keyId: string) => {
    const response = await api.delete(
      `/developer/projects/${projectId}/keys/${keyId}`,
    );
    return response.data;
  },
};

// === NOTIFICATIONS ===
export const notifications = {
  list: async () => {
    const response = await api.get("/notifications/me");
    return response.data;
  },
  markRead: async (id: string) => {
    const response = await api.post(`/notifications/me/${id}/read`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/notifications/me/${id}`);
    return response.data;
  },
};

// === BILLING ===
export const billing = {
  getConfig: async () => {
    const response = await api.get("/billing/config");
    return response.data;
  },
  getPlans: async () => {
    const response = await api.get("/billing/plans");
    return response.data;
  },
  getConnectStatus: async () => {
    const response = await api.get("/billing/connect/status");
    return response.data;
  },
  createConnectOnboarding: async (data: {
    return_url: string;
    refresh_url: string;
  }) => {
    const response = await api.post("/billing/connect/onboarding", data);
    return response.data;
  },
  createCheckoutSession: async (data: {
    price_id: string;
    success_url: string;
    cancel_url: string;
  }) => {
    const response = await api.post("/billing/checkout-session", data);
    return response.data;
  },
};


// === REVIEWS ===
export const reviews = {
  getForRoom: async (roomId: string) => {
    const response = await api.get(`/reviews/room/${roomId}`);
    return response.data;
  },
  getSummary: async (roomId: string) => {
    const response = await api.get(`/reviews/room/${roomId}/summary`);
    return response.data;
  },
  getPending: async () => {
    const response = await api.get("/reviews/admin/pending");
    return response.data;
  },
  moderate: async (
    reviewId: string,
    data: { action: string; reason?: string },
  ) => {
    const response = await api.post(`/reviews/admin/${reviewId}/moderate`, data);
    return response.data;
  },
  delete: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

// === MARKETPLACE ===
export const marketplace = {
  getStats: async () => {
    const response = await api.get("/marketplace/stats");
    return response.data;
  },
  getFeatured: async () => {
    const response = await api.get("/marketplace/featured");
    return response.data;
  },
};

// === ACHIEVEMENTS ===
export const achievements = {
  list: async () => {
    const response = await api.get("/achievements");
    return response.data;
  },
};

// === INTEGRATION CALENDARS ===
export const integrationCalendars = {
  // CRUD
  list: async (params?: { is_active?: boolean; search?: string }) => {
    const response = await api.get("/integration-calendars", { params });
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/integration-calendars/${id}`);
    return response.data;
  },
  create: async (data: CreateIntegrationCalendarData) => {
    const response = await api.post("/integration-calendars", data);
    return response.data;
  },
  update: async (id: string, data: UpdateIntegrationCalendarData) => {
    const response = await api.put(`/integration-calendars/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/integration-calendars/${id}`);
    return response.data;
  },

  // Custom Fields
  getFields: async (calendarId: string) => {
    const response = await api.get(`/integration-calendars/${calendarId}/fields`);
    return response.data;
  },
  createField: async (calendarId: string, data: CreateCustomFieldData) => {
    const response = await api.post(`/integration-calendars/${calendarId}/fields`, data);
    return response.data;
  },
  updateField: async (calendarId: string, fieldId: string, data: UpdateCustomFieldData) => {
    const response = await api.put(`/integration-calendars/${calendarId}/fields/${fieldId}`, data);
    return response.data;
  },
  deleteField: async (calendarId: string, fieldId: string) => {
    const response = await api.delete(`/integration-calendars/${calendarId}/fields/${fieldId}`);
    return response.data;
  },

  // Blocked Dates
  getBlockedDates: async (calendarId: string) => {
    const response = await api.get(`/integration-calendars/${calendarId}/blocked-dates`);
    return response.data;
  },
  createBlockedDate: async (calendarId: string, data: { blocked_date: string; reason?: string }) => {
    const response = await api.post(`/integration-calendars/${calendarId}/blocked-dates`, data);
    return response.data;
  },
  deleteBlockedDate: async (calendarId: string, dateId: string) => {
    const response = await api.delete(`/integration-calendars/${calendarId}/blocked-dates/${dateId}`);
    return response.data;
  },

  // API Key
  regenerateApiKey: async (calendarId: string) => {
    const response = await api.post(`/integration-calendars/${calendarId}/api-key`);
    return response.data;
  },
  revokeApiKey: async (calendarId: string) => {
    const response = await api.delete(`/integration-calendars/${calendarId}/api-key`);
    return response.data;
  },

  // Embed Code
  getEmbedCode: async (calendarId: string) => {
    const response = await api.get(`/integration-calendars/${calendarId}/embed-code`);
    return response.data;
  },
};

// Types
export interface CreateIntegrationCalendarData {
  name: string;
  slug: string;
  description?: string;
  flow_type?: 'room_first' | 'date_first';
  room_ids?: string[];
  timezone?: string;
  slot_duration_minutes?: number;
  slot_interval_minutes?: number;
  advance_booking_hours?: number;
  max_advance_days?: number;
  primary_color?: string;
  background_color?: string;
  font_family?: string;
  border_radius?: number;
  show_available_only?: boolean;
  allow_cancellation?: boolean;
  require_deposit?: boolean;
  min_deposit_amount?: number;
  read_only?: boolean;
  is_active?: boolean;
  is_public?: boolean;
}

export interface UpdateIntegrationCalendarData extends Partial<CreateIntegrationCalendarData> {}

export interface CreateCustomFieldData {
  field_key: string;
  field_type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'email' | 'phone' | 'number';
  field_label: string;
  field_placeholder?: string;
  is_required?: boolean;
  show_in_confirmation?: boolean;
  sort_order?: number;
  options?: Array<{ value: string; label: string }>;
  validation_pattern?: string;
  min_length?: number;
  max_length?: number;
}

export interface UpdateCustomFieldData extends Partial<Omit<CreateCustomFieldData, 'field_key'>> {}

export default api;
