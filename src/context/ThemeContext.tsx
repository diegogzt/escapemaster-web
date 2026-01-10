"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export type Theme =
  | "twilight"
  | "tropical"
  | "vista"
  | "mint"
  | "sunset"
  | "ocean"
  | "nature"
  | "lavender"
  | "fire"
  | string;

export interface PaletteColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  light?: string;
  beige?: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  light: PaletteColors;
  dark: PaletteColors;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  customThemes: CustomTheme[];
  saveCustomTheme: (customTheme: CustomTheme) => void;
  deleteCustomTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<Theme>("tropical");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Load from localStorage first for immediate feedback
    const savedTheme = localStorage.getItem("escapemaster-theme") as Theme;
    const savedDark = localStorage.getItem("escapemaster-dark-mode") === "true";
    const savedCustom = localStorage.getItem("escapemaster-custom-themes");
    
    if (savedTheme) setTheme(savedTheme);
    if (savedDark) setIsDarkMode(savedDark);
    if (savedCustom) {
      try {
        setCustomThemes(JSON.parse(savedCustom));
      } catch (e) {
        console.error("Failed to parse custom themes", e);
      }
    }
    
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
      if (user?.preferences?.customThemes) {
        setCustomThemes(user.preferences.customThemes);
      }
    }
  }, [isAuthenticated, user?.preferences, isInitialized]);

  const saveCustomTheme = (customTheme: CustomTheme) => {
    setCustomThemes(prev => {
      const existingIndex = prev.findIndex(t => t.id === customTheme.id);
      let newThemes;
      if (existingIndex >= 0) {
        newThemes = [...prev];
        newThemes[existingIndex] = customTheme;
      } else {
        newThemes = [...prev, customTheme];
      }
      localStorage.setItem("escapemaster-custom-themes", JSON.stringify(newThemes));
      return newThemes;
    });
  };

  const deleteCustomTheme = (id: string) => {
    setCustomThemes(prev => {
      const newThemes = prev.filter(t => t.id !== id);
      localStorage.setItem("escapemaster-custom-themes", JSON.stringify(newThemes));
      if (theme === id) setTheme("tropical");
      return newThemes;
    });
  };

  useEffect(() => {
    // Apply theme class to body
    const standardThemes = [
      "twilight", "tropical", "vista", "mint", "sunset", "ocean", "nature", "lavender", "fire"
    ];
    
    const themeClasses = standardThemes.map(t => `theme-${t}`);
    document.body.classList.remove(...themeClasses);
    
    const isStandard = standardThemes.includes(theme);
    if (isStandard) {
      document.body.classList.add(`theme-${theme}`);
      // Remove any custom styles
      const root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-background');
      root.style.removeProperty('--color-background-soft');
      root.style.removeProperty('--color-foreground');
      root.style.removeProperty('--color-light');
      root.style.removeProperty('--color-beige');
    } else {
      // Find custom theme
      const custom = customThemes.find(t => t.id === theme);
      if (custom) {
        const colors = isDarkMode ? custom.dark : custom.light;
        const root = document.documentElement;
        
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--color-foreground', colors.foreground);
        
        // Generate derivatives if missing
        const light = colors.light || `${colors.primary}10`; // 10% opacity
        const beige = colors.beige || (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)');
        const bgSoft = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)';

        root.style.setProperty('--color-light', light);
        root.style.setProperty('--color-beige', beige);
        root.style.setProperty('--color-background-soft', bgSoft);
      }
    }
    
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
      const hasCustomThemesChanged = JSON.stringify(user?.preferences?.customThemes) !== JSON.stringify(customThemes);

      if (hasThemeChanged || hasDarkChanged || hasCustomThemesChanged) {
        const newPreferences = {
          ...(user?.preferences || {}),
          theme,
          isDarkMode,
          customThemes
        };
        updateUser({ preferences: newPreferences }).catch(console.error);
      }
    }
  }, [theme, isDarkMode, customThemes, isAuthenticated, isInitialized]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      isDarkMode,
      setIsDarkMode,
      customThemes,
      saveCustomTheme,
      deleteCustomTheme
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
