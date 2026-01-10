import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { auth } from "../services/api";

export type PermissionKey =
  | "view_bookings"
  | "manage_bookings"
  | "view_rooms"
  | "manage_rooms"
  | "view_users"
  | "manage_users"
  | "view_stats"
  | "manage_stats"
  | "view_billing"
  | "manage_billing"
  | "view_settings"
  | "manage_settings";

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadPermissions() {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = await auth.me();
        setUser(userData);
        if (userData.role && userData.role.permissions) {
          const keys = userData.role.permissions.map(
            (p: any) => p.permission_key
          );
          setPermissions(keys);
        }
      } catch (error: any) {
        // Don't log 401 errors as they are handled by the API interceptor
        if (error.response?.status !== 401) {
          console.error("Error loading permissions", error);
        }
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, []);

  const hasPermission = (key: PermissionKey) => {
    return permissions.includes(key);
  };

  return { permissions, hasPermission, loading, user };
}
