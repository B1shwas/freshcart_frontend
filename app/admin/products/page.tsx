"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { ProductApi } from "@/lib/api/client";
import type { Product } from "@/types/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminProductsPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === confirmId),
    [products, confirmId]
  );

  useEffect(() => {
    if (!isAuthenticated) return; // let higher-level redirects handle
    if (!isAdmin) router.replace("/");
  }, [isAuthenticated, isAdmin, router]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = (await ProductApi.list()) as any;
      console.log(data);
      const items: Product[] = Array.isArray(data.products)
        ? data.products
        : Array.isArray(data?.items)
        ? data.items
        : [];
      console.log(items);
      setProducts(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = (id: string) => setConfirmId(id);
  const onConfirmDelete = async () => {
    if (!token || !confirmId) return;
    setConfirmLoading(true);
    try {
      await ProductApi.remove(token, confirmId);
      setProducts((prev) => prev.filter((p) => p.id !== confirmId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setConfirmLoading(false);
      setConfirmId(null);
    }
  };

  const sorted = useMemo(
    () =>
      [...products].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      ),
    [products]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Products
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="outline" className="cursor-pointer">
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/products/create">
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> New Product
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{p.name}</td>
                      <td className="py-2 pr-4">${p.price}</td>
                      <td className="py-2 pr-4">{p.stockQuantity}</td>
                      <td className="py-2 pr-4">{p.category?.name || "N/A"}</td>
                      <td className="py-2 pr-4">
                        {(p as any).isActive ? "Yes" : "No"}
                      </td>
                      <td className="py-2 pr-4 space-x-2">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p.id)}
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!confirmId}
        title="Delete Product"
        description="Are you sure you want to delete this product? This will permanently remove the product and all its data."
        itemDescription={
          selectedProduct
            ? `Product: ${selectedProduct.name} - $${selectedProduct.price}`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmId(null)}
        loading={confirmLoading}
      />
    </div>
  );
}
