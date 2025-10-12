import { http } from "./client";
import type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  ApiResponse,
} from "@/types/api";

export class CartApi {
  /**
   * Get user's cart
   */
  static async get(token: string): Promise<Cart | null> {
    try {
      const response = await http.get<ApiResponse<Cart>>("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      // Return null if cart doesn't exist (404), but throw other errors
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Add item to cart
   */
  static async add(
    token: string,
    request: AddToCartRequest
  ): Promise<CartItem> {
    // Validate request data before sending
    const validatedRequest = {
      productId: request.productId,
      quantity: Math.max(1, Math.floor(Number(request.quantity) || 1)),
    };

    console.log("Adding to cart:", validatedRequest);

    const response = await http.post<ApiResponse<CartItem>>(
      "/cart",
      validatedRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Update cart item quantity
   */
  static async updateItem(
    token: string,
    request: UpdateCartItemRequest
  ): Promise<CartItem> {
    const response = await http.put<ApiResponse<CartItem>>(
      "/cart/item",
      request,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Remove item from cart
   */
  static async removeItem(token: string, cartItemId: string): Promise<void> {
    await http.delete(`/cart/item/${cartItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Clear entire cart
   */
  static async clear(token: string): Promise<void> {
    await http.delete("/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default CartApi;
