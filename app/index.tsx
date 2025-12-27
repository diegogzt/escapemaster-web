import { useEffect } from "react";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        router.replace("/(dashboard)");
      } else {
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  return null;
}
