import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";

const BASE_URL = "http://localhost:3001";

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    cart,
    localCartItems,
    totalAmount,
    totalItems,
    isLoading,
    removeCartItem,
    updateLocalCartQuantity,
    removeFromLocalCart,
    debouncedUpdateCartItem,
  } = useCartStore();

  const { token, isAuthenticated } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine which cart items to display
  const cartItems = isAuthenticated && cart ? cart.items : localCartItems;
  console.log(cart);
  const displayTotalAmount =
    isAuthenticated && cart ? cart.totalAmount : totalAmount;
  const displayTotalItems =
    isAuthenticated && cart ? cart.items.length : totalItems;

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
      // Error handling is done in the store, no need for toast here
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-h-[20px] min-w-[20px] px-1 flex items-center justify-center shadow-md">
          {displayTotalItems > 99 ? "99+" : displayTotalItems}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Cart ({displayTotalItems})
            </h3>
            {displayTotalItems > 0 && (
              <span className="text-sm font-medium text-primary">
                {formatPrice(displayTotalAmount)}
              </span>
            )}
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingBag className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Your cart is empty</p>
                <p className="text-xs text-gray-400">
                  Add some products to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
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
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      {/* Product Image */}
                      <div className="relative w-12 h-12 flex-shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatPrice(itemPrice)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1 mt-1">
                          <button
                            className="h-6 w-6 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            onClick={() =>
                              handleQuantityChange(
                                itemId,
                                productId,
                                itemQuantity,
                                Math.max(0, itemQuantity - 1)
                              )
                            }
                            disabled={isLoading}
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="text-xs font-medium w-6 text-center">
                            {itemQuantity}
                          </span>

                          <button
                            className="h-6 w-6 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            onClick={() =>
                              handleQuantityChange(
                                itemId,
                                productId,
                                itemQuantity,
                                itemQuantity + 1
                              )
                            }
                            disabled={isLoading}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-sm font-medium">
                          {formatPrice(itemPrice * itemQuantity)}
                        </span>
                        <button
                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                          onClick={() => handleRemoveItem(itemId, productId)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {/* Footer - Sticky at bottom */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-2 flex-shrink-0 bg-white">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total:</span>
                <span>{formatPrice(displayTotalAmount)}</span>
              </div>

              <div className="space-y-2">
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="sm">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
