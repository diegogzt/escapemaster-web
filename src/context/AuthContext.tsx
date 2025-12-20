"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

import { auth } from "@/services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        // Ensure cookie is synced with localStorage
        if (!Cookies.get("token")) {
          Cookies.set("token", token, { expires: 7 }); // 7 days
        }

        try {
          // Basic JWT expiration check
          const payload = JSON.parse(atob(token.split(".")[1]));
          const expirationTime = payload.exp * 1000; // Convert to milliseconds

          if (Date.now() >= expirationTime) {
            console.log("Token expired, logging out");
            logout();
            setLoading(false);
            return;
          }

          setIsAuthenticated(true);

          // Fetch user data to check organization
          try {
            const userData = await auth.me();
            setUser(userData);

            // Check if user needs onboarding (no organization)
            const publicRoutes = [
              "/",
              "/login",
              "/register",
              "/forgot-password",
              "/reset-password",
            ];
            const onboardingRoute = "/onboarding";

            if (
              !userData.organization_id &&
              pathname !== onboardingRoute &&
              !publicRoutes.includes(pathname)
            ) {
              router.push("/onboarding");
            }
          } catch (error: any) {
            if (error.response?.status === 401) {
              logout();
            }
          }
        } catch (error) {
          console.error("Failed to validate auth:", error);
          // If token is malformed or validation fails, logout
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to login if not authenticated and on protected route
        const publicRoutes = [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ];
        if (
          !publicRoutes.includes(pathname) &&
          !pathname.startsWith("/reset-password")
        ) {
          // Middleware handles this now, but keeping as fallback
          // router.push("/login");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    Cookies.set("token", token, { expires: 7 }); // 7 days
    setIsAuthenticated(true);
    // Fetch user data immediately after login
    auth.me().then((userData) => {
      setUser(userData);
      if (!userData.organization_id) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  const updateUser = async (data: any) => {
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
