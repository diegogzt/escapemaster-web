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
  | "nature"
  | "lavender"
  | "fire";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<Theme>("tropical");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Load from localStorage first for immediate feedback
    const savedTheme = localStorage.getItem("escapemaster-theme") as Theme;
    const savedDark = localStorage.getItem("escapemaster-dark-mode") === "true";
    
    if (savedTheme) setTheme(savedTheme);
    if (savedDark) setIsDarkMode(savedDark);
    
    // Explicitly do NOT check system preference if no saved preference
    // as per user request: "aunq el usuario tenga el modo oscuro en el navegador, 
    // en el dashboard si l aopcoon no esta activada no se vera el tema oscuro"
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // 2. If authenticated, sync with user preferences from API
    if (isAuthenticated && isInitialized) {
      if (user?.preferences?.theme && user.preferences.theme !== theme) {
        setTheme(user.preferences.theme as Theme);
      }
      if (typeof user?.preferences?.isDarkMode === "boolean") {
        setIsDarkMode(user.preferences.isDarkMode);
      }
    }
  }, [isAuthenticated, user?.preferences, isInitialized]);

  useEffect(() => {
    // Apply theme class to body
    const themeClasses = [
      "theme-twilight",
      "theme-tropical",
      "theme-vista",
      "theme-mint",
      "theme-sunset",
      "theme-ocean",
      "theme-nature",
      "theme-lavender",
      "theme-fire"
    ];
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(`theme-${theme}`);
    
    // Apply dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    localStorage.setItem("escapemaster-theme", theme);
    localStorage.setItem("escapemaster-dark-mode", String(isDarkMode));

    // 3. If authenticated and preferences changed, sync back to API
    if (isAuthenticated && isInitialized) {
      const hasThemeChanged = user?.preferences?.theme !== theme;
      const hasDarkChanged = user?.preferences?.isDarkMode !== isDarkMode;

      if (hasThemeChanged || hasDarkChanged) {
        const newPreferences = {
          ...(user?.preferences || {}),
          theme,
          isDarkMode,
        };
        updateUser({ preferences: newPreferences }).catch(console.error);
      }
    }
  }, [theme, isDarkMode, isAuthenticated, isInitialized]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      isDarkMode,
      setIsDarkMode
    }}>
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
