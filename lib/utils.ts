import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely formats a price value to a currency string
 * Handles null, undefined, string, and number inputs
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "$0.00";
  const numPrice = typeof price === "number" ? price : parseFloat(price) || 0;
  return `$${numPrice.toFixed(2)}`;
}

/**
 * Safely converts a price value to a number
 * Handles null, undefined, string, and number inputs
 */
export function parsePrice(price: number | string | null | undefined): number {
  if (price === null || price === undefined) return 0;
  return typeof price === "number" ? price : parseFloat(price) || 0;
}
