/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Creates a debounced function for cart operations that provides immediate UI feedback
 * while debouncing the actual API calls
 */
export function debounceCartOperation<
  T extends (...args: any[]) => Promise<any>
>(func: T, wait: number): (...args: Parameters<T>) => Promise<void> {
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (...args: Parameters<T>): Promise<void> => {
    return new Promise((resolve) => {
      // Create a unique key for this operation (e.g., based on cart item ID)
      const key = args[1] || "default"; // Use second argument (usually itemId) as key

      // Clear any existing timeout for this specific item
      const existingTimeout = timeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for this item
      const timeout = setTimeout(async () => {
        try {
          await func(...args);
          timeouts.delete(key);
          resolve();
        } catch (error) {
          timeouts.delete(key);
          console.error("Debounced cart operation failed:", error);
          resolve(); // Resolve anyway to prevent hanging promises
        }
      }, wait);

      timeouts.set(key, timeout);
    });
  };
}
