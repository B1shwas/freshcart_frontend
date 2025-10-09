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
      setLoadingCats(true);
      try {
        // Use public API to get categories for parent selection
        const data = (await CategoryApi.list()) as any;
        const items: Category[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setCategories(items);
      } catch (e) {
        console.error("Error loading categories for parent selection:", e);
        // non-blocking; ignore
      } finally {
        setLoadingCats(false);
      }
    };
    loadCats();
  }, []);

  const onSubmit = async (values: FormValues) => {
    let createdCategoryId: string | null = null;

    try {
      if (!token) throw new Error("Not authenticated");

      const file = values.imageFile?.[0];

      // If no image file, just create the category normally
      if (!file) {
        const created = (await CategoryApi.create(token, {
          name: values.name,
          description: values.description || undefined,
          parentId: values.parentId || undefined,
          isActive: values.isActive ?? true,
        })) as any;

        router.push("/admin/categories");
        return;
      }

      // If image file exists, use transaction-like approach
      // 1) Create category first
      const created = (await CategoryApi.create(token, {
        name: values.name,
        description: values.description || undefined,
        parentId: values.parentId || undefined,
        isActive: values.isActive ?? true,
      })) as any;

      createdCategoryId =
        created?.id ||
        created?._id ||
        created?.category?.id ||
        created?.data?.id ||
        created?.data?._id;

      if (!createdCategoryId) {
        throw new Error(
          "Something went wrong while creating the category. Please try again."
        );
      }

      // 2) Try to upload image - if this fails, we'll rollback
      try {
        const uploadRes = (await CategoryApi.uploadImage(
          token,
          createdCategoryId,
          file
        )) as any;

        const imageUrl =
          uploadRes?.url || uploadRes?.imageUrl || uploadRes?.data?.url;

        if (!imageUrl) {
          throw new Error("Image upload failed");
        }

        // Success - redirect
        router.push("/admin/categories");
      } catch (imageError) {
        // Image upload failed - rollback by deleting the created category
        console.error(
          "Image upload failed, rolling back category creation:",
          imageError
        );

        try {
          await CategoryApi.remove(token, createdCategoryId);
        } catch (rollbackError) {
          console.error("Failed to rollback category creation:", rollbackError);
        }

        throw new Error(
          "Something went wrong while uploading the image. Please try again."
        );
      }
    } catch (e) {
      console.error("Category creation error:", e);

      // Set user-friendly error message
      let errorMessage =
        "Something went wrong while creating the category. Please try again.";

      if (e instanceof Error) {
        // Only show specific errors for authentication or validation issues
        if (
          e.message.includes("Not authenticated") ||
          e.message.includes("required")
        ) {
          errorMessage = e.message;
        }
      }

      setError("root", { message: errorMessage });
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
