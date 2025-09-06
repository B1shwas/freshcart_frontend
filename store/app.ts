import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  images: string[];
  category: {
    id: string;
    name: string;
    image?: string;
  };
  stockQuantity: number;
  unit: "kg" | "g" | "l" | "ml" | "pc" | "dozen" | "pack" | "bundle"; // allowed units
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  nutritionFacts?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

interface AppState {
  // Products
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  isProductsLoading: boolean;

  // Cart
  cartItems: CartItem[];
  cartTotal: number;
  cartCount: number;

  // UI State
  isCartOpen: boolean;
  searchQuery: string;
  selectedCategory: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Products
  products: [],
  featuredProducts: [],
  categories: [],
  isProductsLoading: false,

  // Cart
  cartItems: [],
  cartTotal: 0,
  cartCount: 0,

  // UI State
  isCartOpen: false,
  searchQuery: "",
  selectedCategory: null,

  // Actions
  setProducts: (products) => set({ products }),

  setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),

  setCategories: (categories) => set({ categories }),

  addToCart: (product, quantity = 1) => {
    const { cartItems } = get();
    const existingItem = cartItems.find(
      (item) => item.productId === product.id
    );

    let newCartItems: CartItem[];

    if (existingItem) {
      newCartItems = cartItems.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        product,
        quantity,
        price: product.price,
      };
      newCartItems = [...cartItems, newItem];
    }

    const cartTotal = newCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const cartCount = newCartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );

    set({ cartItems: newCartItems, cartTotal, cartCount });
  },

  removeFromCart: (productId) => {
    const { cartItems } = get();
    const newCartItems = cartItems.filter(
      (item) => item.productId !== productId
    );
    const cartTotal = newCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const cartCount = newCartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );

    set({ cartItems: newCartItems, cartTotal, cartCount });
  },

  updateCartQuantity: (productId, quantity) => {
    const { cartItems } = get();

    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const newCartItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );

    const cartTotal = newCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const cartCount = newCartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );

    set({ cartItems: newCartItems, cartTotal, cartCount });
  },

  clearCart: () => set({ cartItems: [], cartTotal: 0, cartCount: 0 }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
