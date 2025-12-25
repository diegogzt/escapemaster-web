"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type Theme =
  | "twilight"
  | "tropical"
  | "vista"
  | "mint"
  | "sunset"
  | "ocean"
  | "lavender"
  | "fire";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<Theme>("tropical");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Load from localStorage first for immediate feedback
    const savedTheme = localStorage.getItem("escapemaster-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // 2. If authenticated, sync with user preferences from API
    if (isAuthenticated && user?.preferences?.theme && isInitialized) {
      if (user.preferences.theme !== theme) {
        setTheme(user.preferences.theme);
      }
    }
  }, [isAuthenticated, user?.preferences?.theme, isInitialized]);

  useEffect(() => {
    // Apply theme class to body
    document.body.classList.remove(
      "theme-twilight",
      "theme-tropical",
      "theme-vista",
      "theme-mint",
      "theme-sunset",
      "theme-ocean",
      "theme-lavender",
      "theme-fire"
    );
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("escapemaster-theme", theme);

    // 3. If authenticated and theme changed, sync back to API
    if (
      isAuthenticated &&
      isInitialized &&
      user?.preferences?.theme !== theme
    ) {
      const newPreferences = {
        ...(user?.preferences || {}),
        theme: theme,
      };
      updateUser({ preferences: newPreferences }).catch(console.error);
    }
  }, [theme, isAuthenticated, isInitialized]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
