"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Heart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";
import { ProductApi, type ProductListParams } from "@/lib/api/products";
import { CategoryApi } from "@/lib/api/categories";

// Product types based on backend response
interface Product {
  id: string;
  name: string;
  description: string;
  price: string; // Backend returns as string
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
}

const BASE_URL = "http://localhost:3001";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryFromUrl || "all"
  );
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);

  // API Data
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = (await CategoryApi.list()) as Category[];
        // Ensure response is an array
        const categoriesArray = Array.isArray(response) ? response : [];
        setCategories([
          {
            id: "all",
            name: "All Products",
            description: "",
            isActive: true,
            createdAt: "",
            updatedAt: "",
            productCount: 0,
          },
          ...categoriesArray,
        ]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to get all subcategory IDs for a given category
  const getAllCategoryIds = (
    categoryId: string,
    allCategories: Category[]
  ): string[] => {
    if (categoryId === "all") return [];

    const result = [categoryId];

    // Find all direct children
    const children = allCategories.filter((cat) => cat.parentId === categoryId);

    // Recursively get children of children
    children.forEach((child) => {
      result.push(...getAllCategoryIds(child.id, allCategories));
    });

    return result;
  };

  // Fetch products with current filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: ProductListParams = {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        };

        // Add filters - include subcategories
        if (selectedCategory !== "all") {
          // Get all category IDs including subcategories
          const categoryIds = getAllCategoryIds(selectedCategory, categories);

          if (categoryIds.length === 1) {
            // Single category
            params.categoryId = selectedCategory;
          } else if (categoryIds.length > 1) {
            // Multiple categories (parent + children) - we'll need to handle this differently
            // For now, let's fetch all products and filter client-side
            // TODO: Backend should support multiple category IDs
            console.log("Filtering by category IDs:", categoryIds);
          } else {
            params.categoryId = selectedCategory;
          }
        }
        if (searchTerm) {
          params.search = searchTerm;
        }
        if (priceRange.min > 0) {
          params.minPrice = priceRange.min;
        }
        if (priceRange.max < 1000) {
          params.maxPrice = priceRange.max;
        }

        console.log("Fetching products with params:", params);
        const response = (await ProductApi.list(params)) as any;
        console.log("API response:", response);

        // Ensure response is an array - handle different response formats
        let productsArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.products)
          ? response.products
          : [];

        // If we have multiple category IDs (parent + children), filter client-side
        if (selectedCategory !== "all") {
          const categoryIds = getAllCategoryIds(selectedCategory, categories);
          if (categoryIds.length > 1) {
            // Get all products and filter by category hierarchy
            const allProductsResponse = (await ProductApi.list({
              limit: 1000, // Get more products to filter from
            })) as any;
            const allProducts = Array.isArray(allProductsResponse)
              ? allProductsResponse
              : Array.isArray(allProductsResponse?.data)
              ? allProductsResponse.data
              : Array.isArray(allProductsResponse?.products)
              ? allProductsResponse.products
              : [];

            // Filter products that belong to any of the category IDs
            productsArray = allProducts.filter((product: Product) =>
              categoryIds.includes(product.categoryId)
            );

            console.log(
              "Filtered by category hierarchy:",
              categoryIds,
              "Found products:",
              productsArray.length
            );
          }
        }

        console.log("Final products array:", productsArray);

        setProducts(productsArray);
        setTotalProducts(productsArray.length);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    selectedCategory,
    searchTerm,
    priceRange,
    currentPage,
    showOnlyInStock,
    showOnlyOnSale,
  ]);

  // Filter and sort products locally (since backend handles most filtering)
  const filteredAndSortedProducts = useMemo(() => {
    // Ensure products is always an array
    if (!Array.isArray(products)) {
      return [];
    }

    let filtered = [...products];

    // Additional local filters
    if (showOnlyInStock) {
      filtered = filtered.filter((product) => product.stockQuantity > 0);
    }

    if (showOnlyOnSale) {
      filtered = filtered.filter(
        (product) =>
          product.discountedPrice &&
          parseFloat(product.discountedPrice) < parseFloat(product.price)
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.averageRating - a.averageRating;
        case "featured":
          return b.isFeatured ? 1 : -1;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, sortBy, showOnlyInStock, showOnlyOnSale]);

  const ProductCard = ({ product }: { product: Product }) => {
    const price = parseFloat(product.price);
    const discountedPrice = product.discountedPrice
      ? parseFloat(product.discountedPrice)
      : null;
    const isOnSale = discountedPrice && discountedPrice < price;
    const inStock = product.stockQuantity > 0;

    const imageUrl = product.thumbnailUrl || product.imageUrls[0];
    const fullImageUrl = imageUrl
      ? `${BASE_URL}${imageUrl}`
      : "/api/placeholder/300/300";

    return (
      <Card className="group hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="relative">
            <Link href={`/products/${product.id}`}>
              <Image
                src={fullImageUrl}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </Link>
            {isOnSale && (
              <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                Sale
              </span>
            )}
            {product.isFeatured && (
              <span className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded">
                <Star className="h-3 w-3" />
              </span>
            )}
            <button className="absolute top-2 right-8 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-lg mb-1 line-clamp-2 hover:text-blue-600">
                {product.name}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviewCount})
              </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  ${discountedPrice || price}
                </span>
                {isOnSale && (
                  <span className="text-sm text-gray-500 line-through">
                    ${price}
                  </span>
                )}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {inStock ? `${product.stockQuantity} in stock` : "Out of stock"}
              </span>
            </div>

            <Button className="w-full" disabled={!inStock}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => {
    const price = parseFloat(product.price);
    const discountedPrice = product.discountedPrice
      ? parseFloat(product.discountedPrice)
      : null;
    const isOnSale = discountedPrice && discountedPrice < price;
    const inStock = product.stockQuantity > 0;

    const imageUrl = product.thumbnailUrl || product.imageUrls[0];
    const fullImageUrl = imageUrl
      ? `${BASE_URL}${imageUrl}`
      : "/api/placeholder/300/300";

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Link href={`/products/${product.id}`}>
              <Image
                src={fullImageUrl}
                alt={product.name}
                width={100}
                height={100}
                className="w-24 h-24 object-cover rounded"
              />
            </Link>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.averageRating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-green-600">
                      ${discountedPrice || price}
                    </span>
                    {isOnSale && (
                      <span className="text-sm text-gray-500 line-through">
                        ${price}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {inStock
                      ? `${product.stockQuantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">
                  {product.category?.name}
                </span>
                <Button disabled={!inStock} size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Products</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Toggle & Sort */}
            <div className="flex items-center gap-3">
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 hidden md:block">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedCategory === category.id
                            ? "bg-blue-100 text-blue-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{category.name}</span>
                          {category.productCount && (
                            <span className="text-gray-500">
                              ({category.productCount})
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            min: Number(e.target.value),
                          }))
                        }
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            max: Number(e.target.value),
                          }))
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlyInStock}
                      onChange={(e) => setShowOnlyInStock(e.target.checked)}
                    />
                    <span className="text-sm">In stock only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlyOnSale}
                      onChange={(e) => setShowOnlyOnSale(e.target.checked)}
                    />
                    <span className="text-sm">On sale only</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {filteredAndSortedProducts.length} of{" "}
                    {totalProducts} products
                  </p>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div>
                    {filteredAndSortedProducts.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {filteredAndSortedProducts.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No products found matching your criteria.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setShowOnlyInStock(false);
                        setShowOnlyOnSale(false);
                        setPriceRange({ min: 0, max: 1000 });
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
