"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { CategoryApi } from "@/lib/api/client";
import type { Category } from "@/types/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return; // let higher-level redirects handle
    if (!isAdmin) router.replace("/");
  }, [isAuthenticated, isAdmin, router]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = (await CategoryApi.list(token)) as any;
      const items: Category[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setCategories(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
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
      await CategoryApi.remove(token, confirmId);
      setCategories((prev) => prev.filter((c) => c.id !== confirmId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setConfirmLoading(false);
      setConfirmId(null);
    }
  };

  const sorted = useMemo(
    () =>
      [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderTree className="h-6 w-6 text-primary" /> Categories
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="outline" className="cursor-pointer">
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/categories/create">
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> New Category
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
          <CardTitle className="text-base">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 pr-4">Sort</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{c.name}</td>
                      <td className="py-2 pr-4">{c.isActive ? "Yes" : "No"}</td>
                      <td className="py-2 pr-4">{c.sortOrder ?? 0}</td>
                      <td className="py-2 pr-4 space-x-2">
                        <Link href={`/admin/categories/${c.id}/edit`}>
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
                          onClick={() => handleDelete(c.id)}
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
        title="Delete category?"
        description="This will permanently remove the category."
        confirmText="Delete"
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmId(null)}
        loading={confirmLoading}
      />
    </div>
  );
}
