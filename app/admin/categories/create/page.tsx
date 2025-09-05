"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { CategoryApi } from "@/lib/api/client";
import type { Category } from "@/types/api";

type FormValues = {
  name: string;
  description?: string;
  image?: string; // will be filled after upload
  imageFile?: FileList; // admin chooses a file
  parentId?: string;
  isActive?: boolean;
};

export default function CreateCategoryPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin) router.replace("/");
  }, [isAuthenticated, isAdmin, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ defaultValues: { isActive: true } });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState<boolean>(false);

  useEffect(() => {
    const loadCats = async () => {
      if (!token) return;
      setLoadingCats(true);
      try {
        const data = (await CategoryApi.list(token)) as any;
        const items: Category[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setCategories(items);
      } catch (e) {
        // non-blocking; ignore
      } finally {
        setLoadingCats(false);
      }
    };
    loadCats();
  }, [token]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!token) throw new Error("Not authenticated");
      // 1) Create category without image first
      const created = (await CategoryApi.create(token, {
        name: values.name,
        description: values.description || undefined,
        parentId: values.parentId || undefined,
        isActive: values.isActive ?? true,
      })) as any;

      const categoryId = created?.id || created?._id || created?.category?.id;
      if (!categoryId) {
        // If API returns envelope with data, try data.id
        const fallbackId = created?.data?.id || created?.data?._id;
        if (!fallbackId)
          throw new Error("Category created but id not found in response");
      }

      let imageUrl: string | undefined = undefined;
      const file = values.imageFile?.[0];
      if (file) {
        // 2) Upload image and get URL from response
        const uploadRes = (await CategoryApi.uploadImage(
          token,
          categoryId || created?.data?.id,
          file
        )) as any;
        imageUrl =
          uploadRes?.url || uploadRes?.imageUrl || uploadRes?.data?.url;
      }

      // if (imageUrl) {
      //   // 3) Update category with uploaded image URL
      //   await CategoryApi.update(token, categoryId || created?.data?.id, {
      //     image: imageUrl,
      //   });
      // }

      router.push("/admin/categories");
    } catch (e) {
      setError("root", { message: e instanceof Error ? e.message : "Failed" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Category</h1>
        <Link href="/admin/categories">
          <Button variant="outline" className="cursor-pointer">
            Back
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root?.message && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {errors.root.message}
              </div>
            )}

            <div>
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Input id="description" {...register("description")} />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="imageFile">
                Image File
              </label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                {...register("imageFile")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. If provided, the image will be uploaded and its URL
                set on the category.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="parentId">
                Parent Category
              </label>
              <select
                id="parentId"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("parentId")}
                disabled={loadingCats}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                className="cursor-pointer"
                {...register("isActive")}
              />
              <label htmlFor="isActive" className="text-sm cursor-pointer">
                Active
              </label>
            </div>

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
