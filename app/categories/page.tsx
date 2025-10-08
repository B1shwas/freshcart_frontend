"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";

// Static categories data
const STATIC_CATEGORIES = [
  {
    id: "1",
    name: "Fruits & Vegetables",
    description: "Fresh, organic produce delivered daily",
    image: "/api/placeholder/400/300",
    productCount: 156,
    subcategories: ["Fresh Fruits", "Vegetables", "Herbs", "Organic Produce"],
  },
  {
    id: "2",
    name: "Dairy & Eggs",
    description: "Farm-fresh dairy products and free-range eggs",
    image: "/api/placeholder/400/300",
    productCount: 78,
    subcategories: ["Milk", "Cheese", "Yogurt", "Eggs", "Butter"],
  },
  {
    id: "3",
    name: "Meat & Seafood",
    description: "Premium quality meat and fresh seafood",
    image: "/api/placeholder/400/300",
    productCount: 92,
    subcategories: ["Beef", "Chicken", "Pork", "Fish", "Shellfish"],
  },
  {
    id: "4",
    name: "Bakery",
    description: "Freshly baked bread, pastries, and desserts",
    image: "/api/placeholder/400/300",
    productCount: 45,
    subcategories: ["Bread", "Pastries", "Cakes", "Cookies"],
  },
  {
    id: "5",
    name: "Beverages",
    description: "Refreshing drinks for every occasion",
    image: "/api/placeholder/400/300",
    productCount: 134,
    subcategories: ["Juices", "Soft Drinks", "Water", "Coffee", "Tea"],
  },
  {
    id: "6",
    name: "Pantry Staples",
    description: "Essential ingredients for your kitchen",
    image: "/api/placeholder/400/300",
    productCount: 203,
    subcategories: ["Rice & Grains", "Pasta", "Spices", "Oils", "Canned Goods"],
  },
  {
    id: "7",
    name: "Frozen Foods",
    description: "Convenient frozen meals and ingredients",
    image: "/api/placeholder/400/300",
    productCount: 87,
    subcategories: [
      "Frozen Vegetables",
      "Ice Cream",
      "Frozen Meals",
      "Frozen Fruits",
    ],
  },
  {
    id: "8",
    name: "Snacks & Sweets",
    description: "Delicious snacks and sweet treats",
    image: "/api/placeholder/400/300",
    productCount: 165,
    subcategories: ["Chips", "Chocolate", "Nuts", "Candy", "Crackers"],
  },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = STATIC_CATEGORIES.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-gray-600 text-lg mb-6">
            Discover fresh, quality products organized by category
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                      {category.productCount} items
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Subcategories */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories
                          .slice(0, 3)
                          .map((sub, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {sub}
                            </span>
                          ))}
                        {category.subcategories.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            +{category.subcategories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {category.productCount} products
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No categories found matching your search.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-6">
            Browse our complete product catalog or use our search feature
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <Button size="lg">Browse All Products</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
