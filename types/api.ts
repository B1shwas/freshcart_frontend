// API Types based on the backend structure

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Related Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ADMIN";
  isEmailVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Related Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  imageUrls: string[];
  thumbnailUrl?: string;
  categoryId: string;
  category: Category;
  stockQuantity: number;
  unit: "kg" | "g" | "l" | "ml" | "pc" | "dozen" | "pack" | "bundle";
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  nutritionFacts?: NutritionFacts;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionFacts {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Related Types
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  cartItemId: string;
}

// Address Related Types
export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

// Order Related Types
export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryAddress: Address;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: string;
  notes?: string;
}

// API Endpoints (for reference)
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",

  // User
  GET_PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",

  // Products
  GET_PRODUCTS: "/product",
  GET_PRODUCT_BY_ID: "/product/:id",
  SEARCH_PRODUCTS: "/product/search",
  GET_FEATURED_PRODUCTS: "/product/featured",

  // Categories
  GET_CATEGORIES: "/category",
  GET_CATEGORY_BY_ID: "/category/:id",
  GET_PRODUCTS_BY_CATEGORY: "/category/:id/products",

  // Cart
  GET_CART: "/cart",
  ADD_TO_CART: "/cart/add",
  UPDATE_CART_ITEM: "/cart/update",
  REMOVE_FROM_CART: "/cart/remove",
  CLEAR_CART: "/cart/clear",

  // Address
  GET_ADDRESSES: "/address",
  CREATE_ADDRESS: "/address",
  UPDATE_ADDRESS: "/address/:id",
  DELETE_ADDRESS: "/address/:id",

  // Orders
  GET_ORDERS: "/order",
  CREATE_ORDER: "/order",
  GET_ORDER_BY_ID: "/order/:id",
  CANCEL_ORDER: "/order/:id/cancel",

  // Health
  HEALTH_CHECK: "/health",
} as const;
