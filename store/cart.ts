import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartApi } from "@/lib/api/cart";
import { useAuthStore } from "./auth";
import { debounceCartOperation } from "@/lib/utils/debounce";
import type {
  Cart,
  CartItem as BackendCartItem,
  AddToCartRequest,
  Product,
} from "@/types/api";

// Local cart item interface (for offline/guest users)
export interface LocalCartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

interface CartState {
  // Cart data
  cart: Cart | null;
  localCartItems: LocalCartItem[];
  isLoading: boolean;
  error: string | null;

  // UI state
  isCartOpen: boolean;
  updatingItems: Set<string>; // Track items being updated

  // Computed values
  totalAmount: number;
  totalItems: number;

  // Actions
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;

  // Local cart operations (for guest users)
  addToLocalCart: (product: Product, quantity?: number) => void;
  removeFromLocalCart: (productId: string) => void;
  updateLocalCartQuantity: (productId: string, quantity: number) => void;
  clearLocalCart: () => void;

  // Backend cart operations (for authenticated users)
  fetchCart: (token: string) => Promise<void>;
  addToCart: (
    token: string,
    productId: string,
    quantity?: number
  ) => Promise<void>;
  updateCartItem: (
    token: string,
    cartItemId: string,
    quantity: number
  ) => Promise<void>;
  removeCartItem: (token: string, cartItemId: string) => Promise<void>;
  clearCart: (token: string) => Promise<void>;

  // Debounced cart operations
  debouncedUpdateCartItem: (
    token: string,
    cartItemId: string,
    quantity: number
  ) => Promise<void>;
  debouncedAddToCart: (
    token: string,
    productId: string,
    quantity?: number
  ) => Promise<void>;

  // Optimistic updates
  optimisticUpdateQuantity: (cartItemId: string, quantity: number) => void;

  // Sync operations
  migrateLocalCartToBackend: (token: string) => Promise<void>;
  clearOnLogout: () => void;
  initializeCart: () => Promise<void>;

  // Error handling
  clearError: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      // Create debounced API functions outside the state
      const debouncedApiUpdate = debounceCartOperation(
        async (token: string, cartItemId: string, quantity: number) => {
          await CartApi.updateItem(token, { cartItemId, quantity });
          // Refresh cart silently after API call
          const cart = await CartApi.get(token);
          if (cart) {
            set((state) => ({
              cart,
              totalAmount: cart.totalAmount,
              totalItems: cart.totalItems,
              updatingItems: new Set(
                [...state.updatingItems].filter((id) => id !== cartItemId)
              ),
            }));
          }
        },
        500
      );

      const debouncedApiAdd = debounceCartOperation(
        async (token: string, productId: string, quantity: number = 1) => {
          const request: AddToCartRequest = { productId, quantity };
          await CartApi.add(token, request);
          // Refresh cart silently after API call
          const cart = await CartApi.get(token);
          if (cart) {
            set({
              cart,
              totalAmount: cart.totalAmount,
              totalItems: cart.totalItems,
            });
          }
        },
        300
      );

      return {
        // Initial state
        cart: null,
        localCartItems: [],
        isLoading: false,
        error: null,
        isCartOpen: false,
        updatingItems: new Set(),
        totalAmount: 0,
        totalItems: 0, // UI actions
        setCartOpen: (open) => set({ isCartOpen: open }),
        toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

        // Local cart operations
        addToLocalCart: (product, quantity = 1) => {
          const { localCartItems } = get();
          const existingItem = localCartItems.find(
            (item) => item.productId === product.id
          );

          let newItems: LocalCartItem[];

          if (existingItem) {
            newItems = localCartItems.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            const newItem: LocalCartItem = {
              id: `local-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              productId: product.id,
              product,
              quantity,
              price: product.price,
            };
            newItems = [...localCartItems, newItem];
          }

          const totalAmount = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({ localCartItems: newItems, totalAmount, totalItems });
        },

        removeFromLocalCart: (productId) => {
          const { localCartItems } = get();
          const newItems = localCartItems.filter(
            (item) => item.productId !== productId
          );

          const totalAmount = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({ localCartItems: newItems, totalAmount, totalItems });
        },

        updateLocalCartQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeFromLocalCart(productId);
            return;
          }

          const { localCartItems } = get();
          const newItems = localCartItems.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          const totalAmount = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({ localCartItems: newItems, totalAmount, totalItems });
        },

        clearLocalCart: () => {
          set({ localCartItems: [], totalAmount: 0, totalItems: 0 });
        },

        // Backend cart operations
        fetchCart: async (token) => {
          set({ isLoading: true, error: null });
          try {
            const cart = await CartApi.get(token);

            if (cart) {
              const totalAmount = cart.totalAmount;
              const totalItems = cart.totalItems;

              set({
                cart,
                totalAmount,
                totalItems,
                isLoading: false,
              });
            } else {
              // No cart exists yet, set to empty state
              set({
                cart: null,
                totalAmount: 0,
                totalItems: 0,
                isLoading: false,
              });
            }
          } catch (error: any) {
            console.error("Failed to fetch cart:", error);
            // Don't show error for 404 (no cart exists yet)
            if (error.response?.status !== 404) {
              set({
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch cart",
                isLoading: false,
              });
            } else {
              set({ isLoading: false });
            }
          }
        },

        addToCart: async (token, productId, quantity = 1) => {
          set({ isLoading: true, error: null });
          try {
            // Validate inputs before API call
            const validQuantity = Math.max(
              1,
              Math.floor(Number(quantity) || 1)
            );
            const request: AddToCartRequest = {
              productId: String(productId),
              quantity: validQuantity,
            };

            console.log("Cart Store - Adding to cart:", {
              productId,
              quantity: validQuantity,
            });

            await CartApi.add(token, request);

            // Refresh cart after adding
            await get().fetchCart(token);
          } catch (error: any) {
            console.error("Failed to add to cart:", error);

            let errorMessage = "Failed to add to cart";

            // Handle specific backend errors
            if (error.response?.status === 500) {
              errorMessage = "Server error. Please try again later.";
            } else if (error.response?.status === 400) {
              errorMessage = "Invalid product or quantity.";
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }

            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        updateCartItem: async (token, cartItemId, quantity) => {
          set({ isLoading: true, error: null });
          try {
            await CartApi.updateItem(token, { cartItemId, quantity });

            // Refresh cart after updating
            await get().fetchCart(token);
          } catch (error) {
            console.error("Failed to update cart item:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to update cart item",
              isLoading: false,
            });
            throw error;
          }
        },

        removeCartItem: async (token, cartItemId) => {
          set({ isLoading: true, error: null });
          try {
            await CartApi.removeItem(token, cartItemId);

            // Refresh cart after removing
            await get().fetchCart(token);
          } catch (error) {
            console.error("Failed to remove cart item:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to remove cart item",
              isLoading: false,
            });
            throw error;
          }
        },

        clearCart: async (token) => {
          set({ isLoading: true, error: null });
          try {
            await CartApi.clear(token);

            set({
              cart: null,
              totalAmount: 0,
              totalItems: 0,
              isLoading: false,
            });
          } catch (error) {
            console.error("Failed to clear cart:", error);
            set({
              error:
                error instanceof Error ? error.message : "Failed to clear cart",
              isLoading: false,
            });
            throw error;
          }
        },

        // Sync operations
        migrateLocalCartToBackend: async (token) => {
          const { localCartItems } = get();
          if (localCartItems.length === 0) return;

          set({ isLoading: true, error: null });
          try {
            // Add each local cart item to backend
            for (const item of localCartItems) {
              await CartApi.add(token, {
                productId: item.productId,
                quantity: item.quantity,
              });
            }

            // Clear local cart after successful migration
            get().clearLocalCart();

            // Fetch updated cart from backend
            await get().fetchCart(token);
          } catch (error) {
            console.error("Failed to migrate cart:", error);
            set({
              error:
                error instanceof Error ? error.message : "Failed to sync cart",
              isLoading: false,
            });
          }
        },

        clearOnLogout: () => {
          set({
            cart: null,
            totalAmount: 0,
            totalItems: 0,
            error: null,
          });
          // Keep local cart items for guest users
        },

        initializeCart: async () => {
          const authState = useAuthStore.getState();

          // If user is authenticated, fetch their cart from backend
          if (authState.isAuthenticated && authState.token) {
            try {
              await get().fetchCart(authState.token);

              // If there are local cart items, migrate them
              const localItems = get().localCartItems;
              if (localItems.length > 0) {
                await get().migrateLocalCartToBackend(authState.token);
              }
            } catch (error: any) {
              // Don't show error for 404 (no cart exists yet)
              if (error.response?.status !== 404) {
                console.error("Failed to initialize cart:", error);
                set({
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to load cart",
                });
              }
            }
          }
          // For guest users, local cart items are already loaded from persistence
        },

        // Error handling
        clearError: () => set({ error: null }),

        // Optimistic updates for immediate UI feedback
        optimisticUpdateQuantity: (cartItemId: string, quantity: number) => {
          const state = get();
          if (state.cart && state.cart.items) {
            const updatedItems = state.cart.items.map((item) =>
              item.id === cartItemId ? { ...item, quantity } : item
            );
            const newTotalAmount = updatedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            const newTotalItems = updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            set({
              cart: {
                ...state.cart,
                items: updatedItems,
                totalAmount: newTotalAmount,
                totalItems: newTotalItems,
              },
              totalAmount: newTotalAmount,
              totalItems: newTotalItems,
              updatingItems: new Set([...state.updatingItems, cartItemId]),
            });
          }
        },

        // Debounced operations
        debouncedUpdateCartItem: async (
          token: string,
          cartItemId: string,
          quantity: number
        ) => {
          // First do optimistic update for immediate UI feedback
          get().optimisticUpdateQuantity(cartItemId, quantity);
          // Then debounce the API call
          await debouncedApiUpdate(token, cartItemId, quantity);
        },

        debouncedAddToCart: async (
          token: string,
          productId: string,
          quantity: number = 1
        ) => {
          set({ error: null });
          await debouncedApiAdd(token, productId, quantity);
        },
      };
    },
    {
      name: "cart-storage",
      // Only persist local cart items and UI state
      partialize: (state) => ({
        localCartItems: state.localCartItems,
        isCartOpen: state.isCartOpen,
      }),
    }
  )
);

// Subscribe to auth changes to handle cart sync
let previousAuth: { isAuthenticated: boolean; token: string | null } | null =
  null;

useAuthStore.subscribe((authState) => {
  const cartState = useCartStore.getState();

  // Skip if not initialized yet
  if (!authState.isInitialized) {
    return;
  }

  // Handle login (guest -> authenticated)
  if (
    !previousAuth?.isAuthenticated &&
    authState.isAuthenticated &&
    authState.token
  ) {
    console.log("User logged in, migrating cart...");
    cartState.migrateLocalCartToBackend(authState.token);
  }

  // Handle logout (authenticated -> guest)
  if (previousAuth?.isAuthenticated && !authState.isAuthenticated) {
    console.log("User logged out, clearing backend cart...");
    cartState.clearOnLogout();
  }

  // Update previous state
  previousAuth = {
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
  };
});
