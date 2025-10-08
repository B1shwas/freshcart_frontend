"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";

// Static data for now
const STATIC_CATEGORIES = [
  { id: "1", name: "All Products", count: 24 },
  { id: "2", name: "Fruits & Vegetables", count: 8 },
  { id: "3", name: "Dairy & Eggs", count: 6 },
  { id: "4", name: "Meat & Seafood", count: 4 },
  { id: "5", name: "Bakery", count: 3 },
  { id: "6", name: "Beverages", count: 3 },
];

const STATIC_PRODUCTS = [
  {
    id: "1",
    name: "Fresh Organic Apples",
    price: 4.99,
    originalPrice: 6.99,
    image: "/api/placeholder/300/300",
    category: "Fruits & Vegetables",
    rating: 4.5,
    reviews: 124,
    inStock: true,
    stockQuantity: 50,
    isFeatured: true,
    isOnSale: true,
    description: "Premium organic apples, crisp and sweet",
  },
  {
    id: "2",
    name: "Whole Milk 1L",
    price: 3.49,
    originalPrice: null,
    image: "/api/placeholder/300/300",
    category: "Dairy & Eggs",
    rating: 4.8,
    reviews: 89,
    inStock: true,
    stockQuantity: 30,
    isFeatured: false,
    isOnSale: false,
    description: "Fresh whole milk from local farms",
  },
  {
    id: "3",
    name: "Atlantic Salmon Fillet",
    price: 12.99,
    originalPrice: 15.99,
    image: "/api/placeholder/300/300",
    category: "Meat & Seafood",
    rating: 4.7,
    reviews: 67,
    inStock: true,
    stockQuantity: 15,
    isFeatured: true,
    isOnSale: true,
    description: "Fresh Atlantic salmon, perfect for grilling",
  },
  {
    id: "4",
    name: "Artisan Sourdough Bread",
    price: 5.99,
    originalPrice: null,
    image: "/api/placeholder/300/300",
    category: "Bakery",
    rating: 4.6,
    reviews: 43,
    inStock: true,
    stockQuantity: 20,
    isFeatured: false,
    isOnSale: false,
    description: "Handcrafted sourdough bread, baked daily",
  },
  {
    id: "5",
    name: "Orange Juice 1L",
    price: 4.49,
    originalPrice: null,
    image: "/api/placeholder/300/300",
    category: "Beverages",
    rating: 4.3,
    reviews: 156,
    inStock: true,
    stockQuantity: 40,
    isFeatured: false,
    isOnSale: false,
    description: "100% pure orange juice, no added sugar",
  },
  {
    id: "6",
    name: "Free Range Eggs (12 pack)",
    price: 6.99,
    originalPrice: 8.99,
    image: "/api/placeholder/300/300",
    category: "Dairy & Eggs",
    rating: 4.9,
    reviews: 201,
    inStock: true,
    stockQuantity: 25,
    isFeatured: true,
    isOnSale: true,
    description: "Farm fresh free-range eggs from happy hens",
  },
  {
    id: "7",
    name: "Organic Bananas",
    price: 2.99,
    originalPrice: null,
    image: "/api/placeholder/300/300",
    category: "Fruits & Vegetables",
    rating: 4.4,
    reviews: 78,
    inStock: false,
    stockQuantity: 0,
    isFeatured: false,
    isOnSale: false,
    description: "Sweet organic bananas, perfect for smoothies",
  },
  {
    id: "8",
    name: "Grass-Fed Ground Beef",
    price: 8.99,
    originalPrice: null,
    image: "/api/placeholder/300/300",
    category: "Meat & Seafood",
    rating: 4.8,
    reviews: 92,
    inStock: true,
    stockQuantity: 18,
    isFeatured: false,
    isOnSale: false,
    description: "Premium grass-fed ground beef, 80/20 lean",
  },
];

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl || "1"
  ); // "All Products" or from URL
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50 });
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = STATIC_PRODUCTS.filter((product) => {
      // Search filter
      if (
        searchTerm &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategory !== "1" &&
        product.category !==
          STATIC_CATEGORIES.find((c) => c.id === selectedCategory)?.name
      ) {
        return false;
      }

      // Price range filter
      if (product.price < priceRange.min || product.price > priceRange.max) {
        return false;
      }

      // Stock filter
      if (showOnlyInStock && !product.inStock) {
        return false;
      }

      // Sale filter
      if (showOnlyOnSale && !product.isOnSale) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "featured":
          return b.isFeatured ? 1 : -1;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    priceRange,
    showOnlyInStock,
    showOnlyOnSale,
  ]);

  const ProductCard = ({
    product,
  }: {
    product: (typeof STATIC_PRODUCTS)[0];
  }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {product.isOnSale && (
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
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews})</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                product.inStock
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.inStock
                ? `${product.stockQuantity} in stock`
                : "Out of stock"}
            </span>
          </div>

          <Button className="w-full" disabled={!product.inStock}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({
    product,
  }: {
    product: (typeof STATIC_PRODUCTS)[0];
  }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-24 h-24 object-cover rounded"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviews})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    product.inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock
                    ? `${product.stockQuantity} in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">{product.category}</span>
              <Button disabled={!product.inStock} size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                    {STATIC_CATEGORIES.map((category) => (
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
                          <span className="text-gray-500">
                            ({category.count})
                          </span>
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
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredAndSortedProducts.length} of{" "}
                {STATIC_PRODUCTS.length} products
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

            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("1");
                    setShowOnlyInStock(false);
                    setShowOnlyOnSale(false);
                    setPriceRange({ min: 0, max: 50 });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
