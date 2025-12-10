"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [theme, setTheme] = useState<Theme>("twilight");

  useEffect(() => {
    // Load theme from local storage if available
    const savedTheme = localStorage.getItem("flowy-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

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
    localStorage.setItem("flowy-theme", theme);
  }, [theme]);

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
