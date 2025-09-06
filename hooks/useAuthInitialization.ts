import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export function useAuthInitialization() {
  const { token, isInitialized, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!isInitialized && token) {
      fetchMe();
    }
  }, [token, isInitialized, fetchMe]);

  return { isInitialized };
}
