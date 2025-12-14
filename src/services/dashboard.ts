import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Public API client (no auth required for these endpoints)
const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Authenticated API client
const authApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string | null;
  layout: WidgetLayoutConfig[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WidgetLayoutConfig {
  id: string;
  type: string;
  colSpan: number;
  rowSpan: number;
  config?: Record<string, unknown>;
}

export interface WidgetDefinition {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  component_path: string;
  default_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWidgetCollection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  layout: WidgetLayoutConfig[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  layout: WidgetLayoutConfig[];
}

export const dashboardService = {
  // Get all available dashboard templates
  getTemplates: async (): Promise<DashboardTemplate[]> => {
    const response = await publicApi.get("/widgets/templates");
    return response.data;
  },

  // Get a specific template by ID
  getTemplate: async (templateId: string): Promise<DashboardTemplate> => {
    const response = await publicApi.get(`/widgets/templates/${templateId}`);
    return response.data;
  },

  // Get all widget definitions
  getWidgetDefinitions: async (): Promise<WidgetDefinition[]> => {
    const response = await publicApi.get("/widgets/definitions");
    return response.data;
  },

  // User Widget Collections
  getCollections: async (): Promise<UserWidgetCollection[]> => {
    const response = await authApi.get("/widgets/collections");
    return response.data;
  },

  getCollection: async (collectionId: string): Promise<UserWidgetCollection> => {
    const response = await authApi.get(`/widgets/collections/${collectionId}`);
    return response.data;
  },

  createCollection: async (data: CreateCollectionRequest): Promise<UserWidgetCollection> => {
    const response = await authApi.post("/widgets/collections", data);
    return response.data;
  },

  updateCollection: async (collectionId: string, data: Partial<CreateCollectionRequest>): Promise<UserWidgetCollection> => {
    const response = await authApi.put(`/widgets/collections/${collectionId}`, data);
    return response.data;
  },

  deleteCollection: async (collectionId: string): Promise<void> => {
    await authApi.delete(`/widgets/collections/${collectionId}`);
  },

  activateCollection: async (collectionId: string): Promise<UserWidgetCollection> => {
    const response = await authApi.post(`/widgets/collections/${collectionId}/activate`);
    return response.data;
  },
};

export default dashboardService;
