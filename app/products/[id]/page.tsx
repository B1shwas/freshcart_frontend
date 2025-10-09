"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Share2,
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";
import { ProductApi, type RelatedProductsParams } from "@/lib/api/products";

// Product types based on backend response
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  discountedPrice?: string;
  discountPercentage?: string;
  imageUrls: string[];
  thumbnailUrl?: string;
  categoryId: string;
  stockQuantity: number;
  unit: string;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

const BASE_URL = "http://localhost:3001";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const productResponse = (await ProductApi.get(productId)) as Product;
        setProduct(productResponse);

        // Fetch related products
        const relatedParams: RelatedProductsParams = { limit: 4 };
        const relatedResponse = (await ProductApi.related(
          productId,
          relatedParams
        )) as Product[];
        setRelatedProducts(relatedResponse);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      // TODO: Implement add to cart API call
      console.log(`Adding ${quantity} of ${product.name} to cart`);
      // Add success notification here
    } catch (err) {
      console.error("Error adding to cart:", err);
      // Add error notification here
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading product details...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 text-lg mb-4">
              {error || "Product not found"}
            </p>
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const price = parseFloat(product.price);
  const discountedPrice = product.discountedPrice
    ? parseFloat(product.discountedPrice)
    : null;
  const isOnSale = discountedPrice && discountedPrice < price;
  const inStock = product.stockQuantity > 0;
  const currentPrice = discountedPrice || price;

  const images =
    product.imageUrls.length > 0
      ? product.imageUrls
      : [product.thumbnailUrl].filter(Boolean);
  const displayImages = images.map((url) =>
    url ? `${BASE_URL}${url}` : "/api/placeholder/600/600"
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative">
              <Image
                src={
                  displayImages[selectedImageIndex] ||
                  "/api/placeholder/600/600"
                }
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-96 object-cover rounded-lg"
              />
              {isOnSale && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm rounded">
                  {product.discountPercentage
                    ? `${product.discountPercentage}% OFF`
                    : "Sale"}
                </span>
              )}
              {product.isFeatured && (
                <span className="absolute top-4 right-4 bg-yellow-500 text-white p-2 rounded">
                  <Star className="h-4 w-4" />
                </span>
              )}
            </div>

            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.averageRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">
                    {product.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                {product.category && (
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.category.name}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-green-600">
                  ${currentPrice.toFixed(2)}
                </span>
                {isOnSale && (
                  <span className="text-xl text-gray-500 line-through">
                    ${price.toFixed(2)}
                  </span>
                )}
                {isOnSale && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 text-sm rounded">
                    Save ${(price - currentPrice).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm ${
                    inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  {inStock
                    ? `${product.stockQuantity} in stock`
                    : "Out of stock"}
                </span>
                {product.unit && (
                  <span className="ml-2 text-gray-600 text-sm">
                    Price per {product.unit}
                  </span>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              {inStock && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center border rounded">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 border-x">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setQuantity(
                            Math.min(product.stockQuantity, quantity + 1)
                          )
                        }
                        disabled={quantity >= product.stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 mr-2" />
                      )}
                      Add to Cart - ${(currentPrice * quantity).toFixed(2)}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mt-8 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Free delivery on orders over $50</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Fresh guarantee - 100% satisfaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Carefully packaged for freshness</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedPrice = parseFloat(relatedProduct.price);
                const relatedDiscountedPrice = relatedProduct.discountedPrice
                  ? parseFloat(relatedProduct.discountedPrice)
                  : null;
                const relatedIsOnSale =
                  relatedDiscountedPrice &&
                  relatedDiscountedPrice < relatedPrice;
                const relatedInStock = relatedProduct.stockQuantity > 0;

                const relatedImageUrl =
                  relatedProduct.thumbnailUrl || relatedProduct.imageUrls[0];
                const relatedFullImageUrl = relatedImageUrl
                  ? `${BASE_URL}${relatedImageUrl}`
                  : "/api/placeholder/300/300";

                return (
                  <Card
                    key={relatedProduct.id}
                    className="group hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <Link href={`/products/${relatedProduct.id}`}>
                          <Image
                            src={relatedFullImageUrl}
                            alt={relatedProduct.name}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        </Link>
                        {relatedIsOnSale && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                            Sale
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <Link href={`/products/${relatedProduct.id}`}>
                          <h3 className="font-semibold text-lg mb-1 line-clamp-2 hover:text-blue-600">
                            {relatedProduct.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(relatedProduct.averageRating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({relatedProduct.reviewCount})
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-green-600">
                              ${relatedDiscountedPrice || relatedPrice}
                            </span>
                            {relatedIsOnSale && (
                              <span className="text-sm text-gray-500 line-through">
                                ${relatedPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          disabled={!relatedInStock}
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {relatedInStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
