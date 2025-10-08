"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Shield,
  Clock,
  Leaf,
  Star,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import { ProductApi, CategoryApi } from "@/lib/api/client";

// Types for the data from backend
type Product = {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  imageUrls?: string[];
  thumbnailUrl?: string;
  unit: string;
  stockQuantity: number;
  isFeatured: boolean;
  category?: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
};

// Helper functions to get display values
const getProductImage = (product: Product): string => {
  return (
    product.thumbnailUrl || product.imageUrls?.[0] || "/api/placeholder/300/300"
  );
};

const getCategoryImage = (category: Category): string => {
  return category.imageUrl || "/api/placeholder/200/200";
};

const getDiscountPercentage = (product: Product): number | null => {
  if (product.discountedPrice && product.price > product.discountedPrice) {
    return Math.round(
      ((product.price - product.discountedPrice) / product.price) * 100
    );
  }
  return product.discountPercentage || null;
};

const getDisplayPrice = (product: Product): number => {
  return product.discountedPrice || product.price;
};

const getOriginalPrice = (product: Product): number | null => {
  return product.discountedPrice ? product.price : null;
};

export function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch featured products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          ProductApi.featuredAll(),
          CategoryApi.list(),
        ]);

        setFeaturedProducts(
          Array.isArray(productsData) ? productsData.slice(0, 4) : []
        );
        setCategories(
          Array.isArray(categoriesData) ? categoriesData.slice(0, 6) : []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        // Keep empty arrays on error - component will show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Groceries
                <span className="text-primary block">Delivered Daily</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-md">
                Get the freshest fruits, vegetables, and groceries delivered to
                your doorstep. Quality guaranteed, always fresh.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Learn More
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Free Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">100% Fresh</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">30 Min Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Organic Options</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Image
                  src="/api/placeholder/500/400"
                  alt="Fresh groceries"
                  width={500}
                  height={400}
                  className="rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover fresh, quality groceries across all your favorite
              categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                >
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <Image
                          src={`http://localhost:3001${getCategoryImage(
                            category
                          )}`}
                          alt={category.imageUrl || "fie"}
                          width={80}
                          height={80}
                          className="mx-auto rounded-full !h-20 w-20 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.productCount || 0} items
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No categories available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Hand-picked favorites from our fresh collection
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton for products
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => {
                const discount = getDiscountPercentage(product);
                const displayPrice = getDisplayPrice(product);
                const originalPrice = getOriginalPrice(product);

                return (
                  <Card
                    key={product.id}
                    className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={`http://localhost:3001${getProductImage(
                            product
                          )}`}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        {discount && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>

                        {/* Since we don't have rating in backend yet, show placeholder */}
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 ml-1">
                            4.5
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg text-primary">
                              ${displayPrice}
                            </span>
                            {originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${originalPrice}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {product.unit}
                            </span>
                          </div>
                        </div>

                        <Button className="w-full mt-3" size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No featured products available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FreshCart?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to bringing you the freshest groceries with
              unmatched convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Organic</h3>
              <p className="text-gray-600">
                All our produce is certified organic and naturally grown without
                harmful chemicals
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Get your groceries delivered in 30 minutes or less, right to
                your doorstep
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Quality Guaranteed
              </h3>
              <p className="text-gray-600">
                Not satisfied? We&apos;ll replace it or refund your money - no
                questions asked
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Our customer support team is always here to help with any
                questions or concerns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of happy customers who trust FreshCart for their
            daily grocery needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4"
              >
                Start Shopping Now
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Download App
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
