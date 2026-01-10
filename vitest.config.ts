import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    deps: {
      inline: [
        "react-native",
        "expo-router",
        "expo-secure-store",
        "lucide-react-native",
        "@testing-library/react-native",
      ],
    },
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
  },
});
