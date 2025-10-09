"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";
import { CategoryApi } from "@/lib/api/categories";

// Category types based on backend response
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  parentId?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
}

const BASE_URL = "http://localhost:3001";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch root categories (categories without parent)
        const response = (await CategoryApi.getRootCategories()) as Category[];

        // Fetch subcategories for each category
        const categoriesWithSubs = await Promise.all(
          response.map(async (category) => {
            try {
              const subcategories = (await CategoryApi.getSubcategories(
                category.id
              )) as Category[];
              return { ...category, subcategories };
            } catch (err) {
              // If subcategories fail to load, continue without them
              console.warn(
                `Failed to load subcategories for ${category.name}:`,
                err
              );
              return { ...category, subcategories: [] };
            }
          })
        );

        setCategories(categoriesWithSubs);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading categories...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

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
          {filteredCategories.map((category) => {
            const imageUrl = category.imageUrl
              ? `${BASE_URL}${category.imageUrl}`
              : "/api/placeholder/400/300";

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {category.productCount && (
                        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                          {category.productCount} items
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* Subcategories */}
                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {category.subcategories
                                .slice(0, 3)
                                .map((sub, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                  >
                                    {sub.name}
                                  </span>
                                ))}
                              {category.subcategories.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  +{category.subcategories.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {category.productCount || 0} products
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
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
