"use client";

import { useState } from "react";
import { Clock, Star, ShoppingCart, Heart, Tag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";

// Static deals data
const FEATURED_DEALS = [
  {
    id: "1",
    name: "Fresh Organic Apples",
    originalPrice: 6.99,
    salePrice: 4.99,
    discount: 29,
    image: "/api/placeholder/300/300",
    category: "Fruits & Vegetables",
    rating: 4.5,
    reviews: 124,
    timeLeft: "2 days",
    stockLeft: 15,
    isLimitedTime: true,
  },
  {
    id: "2",
    name: "Atlantic Salmon Fillet",
    originalPrice: 15.99,
    salePrice: 12.99,
    discount: 19,
    image: "/api/placeholder/300/300",
    category: "Meat & Seafood",
    rating: 4.7,
    reviews: 67,
    timeLeft: "1 day",
    stockLeft: 8,
    isLimitedTime: true,
  },
  {
    id: "3",
    name: "Free Range Eggs (12 pack)",
    originalPrice: 8.99,
    salePrice: 6.99,
    discount: 22,
    image: "/api/placeholder/300/300",
    category: "Dairy & Eggs",
    rating: 4.9,
    reviews: 201,
    timeLeft: "3 days",
    stockLeft: 25,
    isLimitedTime: false,
  },
];

const DAILY_DEALS = [
  {
    id: "4",
    name: "Organic Bananas",
    originalPrice: 3.99,
    salePrice: 2.99,
    discount: 25,
    image: "/api/placeholder/200/200",
    category: "Fruits & Vegetables",
    rating: 4.4,
    stockLeft: 30,
  },
  {
    id: "5",
    name: "Whole Milk 1L",
    originalPrice: 4.49,
    salePrice: 3.49,
    discount: 22,
    image: "/api/placeholder/200/200",
    category: "Dairy & Eggs",
    rating: 4.8,
    stockLeft: 45,
  },
  {
    id: "6",
    name: "Artisan Bread",
    originalPrice: 7.99,
    salePrice: 5.99,
    discount: 25,
    image: "/api/placeholder/200/200",
    category: "Bakery",
    rating: 4.6,
    stockLeft: 12,
  },
  {
    id: "7",
    name: "Orange Juice 1L",
    originalPrice: 5.99,
    salePrice: 4.49,
    discount: 25,
    image: "/api/placeholder/200/200",
    category: "Beverages",
    rating: 4.3,
    stockLeft: 20,
  },
];

const BULK_DEALS = [
  {
    id: "8",
    name: "Organic Vegetable Bundle",
    originalPrice: 24.99,
    salePrice: 19.99,
    discount: 20,
    image: "/api/placeholder/250/250",
    category: "Fruits & Vegetables",
    rating: 4.7,
    includes: ["Carrots", "Broccoli", "Bell Peppers", "Onions"],
    savings: "$5.00",
  },
  {
    id: "9",
    name: "Meat Lover's Pack",
    originalPrice: 45.99,
    salePrice: 36.99,
    discount: 20,
    image: "/api/placeholder/250/250",
    category: "Meat & Seafood",
    rating: 4.8,
    includes: ["Ground Beef", "Chicken Breast", "Pork Chops", "Sausages"],
    savings: "$9.00",
  },
];

export default function DealsPage() {
  const [activeTab, setActiveTab] = useState<"featured" | "daily" | "bulk">(
    "featured"
  );

  const FeaturedDealCard = ({ deal }: { deal: (typeof FEATURED_DEALS)[0] }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={deal.image}
            alt={deal.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded font-bold">
            -{deal.discount}%
          </div>
          {deal.isLimitedTime && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 text-xs rounded flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Limited
            </div>
          )}
          <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{deal.name}</h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(deal.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({deal.reviews})</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">
                ${deal.salePrice}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${deal.originalPrice}
              </span>
            </div>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Save ${(deal.originalPrice - deal.salePrice).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="flex items-center gap-1 text-orange-600">
              <Clock className="h-4 w-4" />
              {deal.timeLeft} left
            </span>
            <span className="text-gray-600">
              {deal.stockLeft} left in stock
            </span>
          </div>

          <Button className="w-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DailyDealCard = ({ deal }: { deal: (typeof DAILY_DEALS)[0] }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={deal.image}
            alt={deal.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{deal.name}</h3>
              <span className="bg-red-500 text-white px-2 py-1 text-xs rounded">
                -{deal.discount}%
              </span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(deal.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">
                  ${deal.salePrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${deal.originalPrice}
                </span>
              </div>
              <Button size="sm">Add to Cart</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BulkDealCard = ({ deal }: { deal: (typeof BULK_DEALS)[0] }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={deal.image}
            alt={deal.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 text-xs rounded font-bold">
            Bundle Deal
          </div>
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
            Save {deal.savings}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{deal.name}</h3>

          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Includes:</p>
            <div className="flex flex-wrap gap-1">
              {deal.includes.map((item, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">
                ${deal.salePrice}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${deal.originalPrice}
              </span>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              -{deal.discount}% off
            </span>
          </div>

          <Button className="w-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add Bundle to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Tag className="h-8 w-8 text-red-500" />
            Special Deals & Offers
          </h1>
          <p className="text-gray-600 text-lg">
            Save big on fresh, quality products with our limited-time offers
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex rounded-lg border bg-gray-50 p-1">
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "featured"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Featured Deals
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "daily"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Daily Deals
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "bulk"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bulk Deals
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "featured" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🔥 Featured Flash Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_DEALS.map((deal) => (
                <FeaturedDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "daily" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              ⏰ Today's Special Deals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DAILY_DEALS.map((deal) => (
                <DailyDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "bulk" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📦 Bundle & Save</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BULK_DEALS.map((deal) => (
                <BulkDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Don't Miss Out!</h2>
          <p className="text-gray-600 mb-6">
            Join our newsletter to get notified about exclusive deals and flash
            sales
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Subscribe to Newsletter</Button>
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
