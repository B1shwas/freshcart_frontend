"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { AuthApi } from "@/lib/api/client";

export function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, setUser, setToken } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!token) return; // not logged in
      try {
        const me = await AuthApi.me(token);
        if (!cancelled) setUser(me as any);
      } catch {
        if (cancelled) return;
        // token invalid/expired -> clear and redirect home
        setUser(null);
        setToken(null);
        if (
          pathname?.startsWith("/admin") ||
          pathname?.startsWith("/account") ||
          pathname?.startsWith("/profile")
        ) {
          router.replace("/");
        }
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [token, router, pathname, setUser, setToken]);

  return null;
}
