"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Package, ShoppingCart, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { http } from "@/lib/api/client";

type DashboardStats = {
  products?: number;
  categories?: number;
  orders?: number;
  users?: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({});
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Guard: only admins can access
  useEffect(() => {
    if (!isAuthenticated) return; // allow login redirect flow elsewhere
    if (!isAdmin) router.replace("/");
  }, [isAuthenticated, isAdmin, router]);

  // Optional: try to fetch some lightweight counts if available
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        // These endpoints are placeholders. Replace with actual ones as they become available.
        const [productsRes, categoriesRes] = await Promise.all([
          http.get("/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          http.get("/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          products: Array.isArray(productsRes.data?.data?.items)
            ? productsRes.data.data.items.length
            : Array.isArray(productsRes.data?.data)
            ? productsRes.data.data.length
            : undefined,
          categories: Array.isArray(categoriesRes.data?.data?.items)
            ? categoriesRes.data.data.items.length
            : Array.isArray(categoriesRes.data?.data)
            ? categoriesRes.data.data.length
            : undefined,
        });
      } catch {
        // Silent fail; keep page usable without stats
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" /> Admin Dashboard
        </h1>
        <Link href="/">
          <Button variant="outline" className="cursor-pointer">
            Back to Store <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" /> Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.products ?? "—"}</p>
            <Link href="/admin/products">
              <Button variant="link" className="px-0 cursor-pointer">
                Manage
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.users ?? "—"}</p>
            <Button variant="link" className="px-0 cursor-pointer" disabled>
              Manage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" /> Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.orders ?? "—"}</p>
            <Button variant="link" className="px-0 cursor-pointer" disabled>
              Manage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" /> Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.categories ?? "—"}</p>
            <Link href="/admin/categories">
              <Button variant="link" className="px-0 cursor-pointer">
                Manage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/products/create">
            <Button className="cursor-pointer">Add Product</Button>
          </Link>
          <Link href="/admin/categories/create">
            <Button variant="outline" className="cursor-pointer">
              Add Category
            </Button>
          </Link>
          <Button variant="ghost" className="cursor-pointer" disabled>
            View Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
