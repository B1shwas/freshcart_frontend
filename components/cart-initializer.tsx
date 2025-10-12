"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

export function CartInitializer() {
  const { isInitialized } = useAuthStore();
  const { initializeCart } = useCartStore();

  useEffect(() => {
    // Only initialize cart after auth has been checked
    if (isInitialized) {
      initializeCart();
    }
  }, [isInitialized, initializeCart]);

  return null;
}
