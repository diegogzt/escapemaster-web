"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  }, [router]);

  const login = useCallback((token: string) => {
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
    }).catch((error) => {
      console.error("Login failed during user fetch:", error);
      // If we can't get user data, we might want to logout or show error
      // For now, we'll just log it, but ideally we should handle it.
    });
  }, [router]);

  const updateUser = useCallback(async (data: any) => {
    setUser((prev: any) => ({ ...prev, ...data }));
  }, []);

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
            console.log("AUTH: Token expired, logging out");
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
            const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/privacy", "/cookies"];
            const onboardingRoute = "/onboarding";

            if (
              !userData.organization_id &&
              pathname !== onboardingRoute &&
              !publicRoutes.includes(pathname)
            ) {
              console.log(`AUTH: User has no org, redirecting from ${pathname} to /onboarding`);
              router.push("/onboarding");
            }
          } catch (error: any) {
            console.error("AUTH: Failed to fetch user data:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
              logout();
            }
          }
        } catch (error) {
          console.error("AUTH: Failed to validate auth:", error);
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to login if not authenticated and on protected route
        const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/privacy", "/cookies"];
        
        const isPublic = publicRoutes.includes(pathname) || pathname.startsWith("/reset-password");
        
        if (!isPublic) {
           console.log(`AUTH: Fallback redirect for unauth user from ${pathname} to /login`);
           router.push("/login");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router, logout]);

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
