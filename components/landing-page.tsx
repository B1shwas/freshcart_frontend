"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Shield, Clock, Leaf, Star, ArrowRight } from "lucide-react";

// Mock data - these will come from your backend later
const featuredProducts = [
  {
    id: "1",
    name: "Organic Bananas",
    price: 2.99,
    originalPrice: 3.99,
    image: "/api/placeholder/300/300",
    discount: 25,
    rating: 4.8,
    unit: "per lb",
  },
  {
    id: "2",
    name: "Fresh Strawberries",
    price: 5.99,
    originalPrice: 7.99,
    image: "/api/placeholder/300/300",
    discount: 25,
    rating: 4.9,
    unit: "per pack",
  },
  {
    id: "3",
    name: "Organic Spinach",
    price: 3.49,
    image: "/api/placeholder/300/300",
    rating: 4.7,
    unit: "per bunch",
  },
  {
    id: "4",
    name: "Fresh Avocados",
    price: 1.99,
    image: "/api/placeholder/300/300",
    rating: 4.6,
    unit: "each",
  },
];

const categories = [
  { id: "1", name: "Fruits", image: "/api/placeholder/200/200", count: 45 },
  { id: "2", name: "Vegetables", image: "/api/placeholder/200/200", count: 62 },
  { id: "3", name: "Dairy", image: "/api/placeholder/200/200", count: 28 },
  {
    id: "4",
    name: "Meat & Fish",
    image: "/api/placeholder/200/200",
    count: 34,
  },
  { id: "5", name: "Bakery", image: "/api/placeholder/200/200", count: 19 },
  { id: "6", name: "Beverages", image: "/api/placeholder/200/200", count: 41 },
];

export function LandingPage() {
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
                <Button size="lg" className="text-lg px-8 py-4">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={80}
                      height={80}
                      className="mx-auto rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.count} items
                  </p>
                </CardContent>
              </Card>
            ))}
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
            <Button variant="outline">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg text-primary">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {product.unit}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full mt-3" size="sm">
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Start Shopping Now
            </Button>
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
