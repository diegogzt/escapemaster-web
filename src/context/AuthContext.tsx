"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { auth } from "@/services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
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
          router.push("/login");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
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
