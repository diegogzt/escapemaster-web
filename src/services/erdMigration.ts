import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.escapemaster.es";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 min — migration can be slow
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Types ───

export type MigrationModule =
  | "rooms"
  | "bookings"
  | "payments"
  | "coupons"
  | "employees"
  | "gdpr";

export interface ErdAuthResponse {
  success: boolean;
  erd_session_id: string | null;
  message: string;
}

export interface ErdPreviewModule {
  module: string;
  count: number;
  label: string;
  depends_on: string[];
}

export interface ErdPreviewResponse {
  modules: ErdPreviewModule[];
}

export interface ErdMigrateModuleResult {
  module: string;
  status: "completed" | "partial" | "error";
  migrated: number;
  skipped: number;
  errors: string[];
}

export interface ErdMigrateResponse {
  success: boolean;
  results: ErdMigrateModuleResult[];
}

// ─── Dependency graph ───

const DEPENDENCY_MAP: Record<MigrationModule, MigrationModule[]> = {
  rooms: [],
  bookings: ["rooms"],
  payments: ["bookings"],
  coupons: [],
  employees: [],
  gdpr: ["rooms"],
};

export function resolveDependencies(selected: MigrationModule[]): MigrationModule[] {
  const result = new Set<MigrationModule>(selected);

  for (const mod of selected) {
    for (const dep of DEPENDENCY_MAP[mod]) {
      result.add(dep);
    }
  }

  return Array.from(result);
}

export function getMissingDependencies(
  selected: MigrationModule[],
): { module: MigrationModule; requires: MigrationModule }[] {
  const missing: { module: MigrationModule; requires: MigrationModule }[] = [];
  const selectedSet = new Set(selected);

  for (const mod of selected) {
    for (const dep of DEPENDENCY_MAP[mod]) {
      if (!selectedSet.has(dep)) {
        missing.push({ module: mod, requires: dep });
      }
    }
  }

  return missing;
}

// ─── API Calls ───

export const erdMigration = {
  authenticate: async (
    email: string,
    password: string,
  ): Promise<ErdAuthResponse> => {
    const response = await api.post("/migration/erd/auth", { email, password });
    return response.data;
  },

  preview: async (erdSessionId: string): Promise<ErdPreviewResponse> => {
    const response = await api.post("/migration/erd/preview", {
      erd_session_id: erdSessionId,
    });
    return response.data;
  },

  execute: async (
    erdSessionId: string,
    modules: MigrationModule[],
  ): Promise<ErdMigrateResponse> => {
    const response = await api.post("/migration/erd/execute", {
      erd_session_id: erdSessionId,
      modules,
    });
    return response.data;
  },
};
