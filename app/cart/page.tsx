"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

const BASE_URL = "http://localhost:3001";

export default function CartPage() {
  const {
    cart,
    localCartItems,
    totalAmount,
    totalItems,
    isLoading,
    error,
    fetchCart,
    removeCartItem,
    clearCart,
    updateLocalCartQuantity,
    removeFromLocalCart,
    clearLocalCart,
    clearError,
    debouncedUpdateCartItem,
  } = useCartStore();

  const { token, isAuthenticated } = useAuthStore();

  // Fetch cart on component mount for authenticated users
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart(token);
    }
  }, [isAuthenticated, token, fetchCart]);

  // Determine which cart items to display
  const cartItems = isAuthenticated && cart ? cart.items : localCartItems;
  const displayTotalAmount =
    isAuthenticated && cart ? cart.totalAmount : totalAmount;
  const displayTotalItems =
    isAuthenticated && cart ? cart.totalItems : totalItems;

  const handleQuantityChange = async (
    itemId: string,
    productId: string,
    currentQuantity: number,
    newQuantity: number
  ) => {
    if (newQuantity < 0) return;

    try {
      if (isAuthenticated && token) {
        if (newQuantity === 0) {
          // Remove item immediately (no need to debounce removal)
          await removeCartItem(token, itemId);
        } else {
          // Use debounced update for quantity changes (includes optimistic update)
          await debouncedUpdateCartItem(token, itemId, newQuantity);
        }
      } else {
        if (newQuantity === 0) {
          removeFromLocalCart(productId);
        } else {
          updateLocalCartQuantity(productId, newQuantity);
        }
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  const handleRemoveItem = async (itemId: string, productId: string) => {
    try {
      if (isAuthenticated && token) {
        await removeCartItem(token, itemId);
      } else {
        removeFromLocalCart(productId);
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      if (isAuthenticated && token) {
        await clearCart(token);
      } else {
        clearLocalCart();
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `$${numPrice.toFixed(2)}`;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-gray-600">
                {displayTotalItems} {displayTotalItems === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={isLoading}
            >
              Clear Cart
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Updating cart...</span>
          </div>
        )}

        {/* Empty Cart */}
        {!isLoading && cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some products to get started!
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}

        {/* Cart Content */}
        {!isLoading && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => {
                    const product = "product" in item ? item.product : item;
                    const itemPrice =
                      "price" in item ? item.price : product.price;
                    const itemQuantity = item.quantity;
                    const itemId = item.id;
                    const productId =
                      "productId" in item ? item.productId : product.id;

                    return (
                      <div
                        key={itemId}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={
                              product.thumbnailUrl
                                ? `${BASE_URL}${product.thumbnailUrl}`
                                : product.imageUrls &&
                                  product.imageUrls.length > 0
                                ? `${BASE_URL}${product.imageUrls[0]}`
                                : "/placeholder-product.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {product.name}
                          </h3>
                          <p className="text-gray-600">
                            {formatPrice(itemPrice)} each
                          </p>
                          <p className="text-sm text-gray-500">
                            In Stock: {product.stockQuantity} {product.unit}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleQuantityChange(
                                itemId,
                                productId,
                                itemQuantity,
                                itemQuantity - 1
                              )
                            }
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="text-lg font-medium w-12 text-center">
                            {itemQuantity}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleQuantityChange(
                                itemId,
                                productId,
                                itemQuantity,
                                itemQuantity + 1
                              )
                            }
                            disabled={
                              isLoading || itemQuantity >= product.stockQuantity
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatPrice(itemPrice * itemQuantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(itemId, productId)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({displayTotalItems} items):</span>
                      <span>{formatPrice(displayTotalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(displayTotalAmount * 0.08)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(displayTotalAmount * 1.08)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>

                  {/* Benefits */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      Why shop with us?
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Free delivery on orders over $50</li>
                      <li>• Fresh guarantee - 100% satisfaction</li>
                      <li>• Easy returns within 7 days</li>
                      <li>• Secure payment processing</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
