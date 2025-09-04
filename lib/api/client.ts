import { ApiResponse } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from localStorage (in client-side only)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth-storage")
        : null;

    let authToken = "";
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed.state?.token || "";
      } catch (e) {
        console.warn("Failed to parse auth token from localStorage");
      }
    }

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    } as Record<string, string>;

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

// Convenience methods for common API calls
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => apiClient.post("/auth/register", userData),

  logout: () => apiClient.post("/auth/logout"),

  refreshToken: () => apiClient.post("/auth/refresh"),
};

export const productApi = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    return apiClient.get(`/product${queryString ? `?${queryString}` : ""}`);
  },

  getProductById: (id: string) => apiClient.get(`/product/${id}`),

  getFeaturedProducts: () => apiClient.get("/product/featured"),
};

export const categoryApi = {
  getCategories: () => apiClient.get("/category"),

  getCategoryById: (id: string) => apiClient.get(`/category/${id}`),

  getProductsByCategory: (id: string) =>
    apiClient.get(`/category/${id}/products`),
};

export const cartApi = {
  getCart: () => apiClient.get("/cart"),

  addToCart: (productId: string, quantity: number) =>
    apiClient.post("/cart/add", { productId, quantity }),

  updateCartItem: (cartItemId: string, quantity: number) =>
    apiClient.patch("/cart/update", { cartItemId, quantity }),

  removeFromCart: (cartItemId: string) =>
    apiClient.post("/cart/remove", { cartItemId }),

  clearCart: () => apiClient.delete("/cart/clear"),
};

export const addressApi = {
  getAddresses: () => apiClient.get("/address"),

  createAddress: (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    type: "HOME" | "WORK" | "OTHER";
    isDefault?: boolean;
  }) => apiClient.post("/address", address),

  updateAddress: (
    id: string,
    address: Partial<{
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      type: "HOME" | "WORK" | "OTHER";
      isDefault: boolean;
    }>
  ) => apiClient.put(`/address/${id}`, address),

  deleteAddress: (id: string) => apiClient.delete(`/address/${id}`),
};

export const orderApi = {
  getOrders: () => apiClient.get("/order"),

  createOrder: (order: {
    addressId: string;
    paymentMethod: string;
    notes?: string;
  }) => apiClient.post("/order", order),

  getOrderById: (id: string) => apiClient.get(`/order/${id}`),

  cancelOrder: (id: string) => apiClient.patch(`/order/${id}/cancel`),
};
