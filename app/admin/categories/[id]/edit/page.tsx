"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  imageFile?: FileList;
  parentId?: string;
  isActive?: boolean;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const { token, isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ defaultValues: { isActive: true } });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin) router.replace("/");
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    const load = async () => {
      if (!token || !id) return;
      try {
        const cat = (await CategoryApi.get(token, id)) as Category;
        reset({
          name: cat.name,
          description: cat.description,
          isActive: cat.isActive ?? true,
          parentId: (cat as any).parentId || "",
        });
      } catch (e) {
        setError("root", {
          message: e instanceof Error ? e.message : "Failed",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, id, reset, setError]);

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
        // Filter out the current category to prevent circular parent relationships
        setCategories(items.filter((c) => c.id !== id));
      } catch (e) {
        console.error("Error loading categories for parent selection:", e);
        // ignore non-blocking
      } finally {
        setLoadingCats(false);
      }
    };
    loadCats();
  }, [id]);

  const onSubmit = async (values: FormValues) => {
    let originalCategoryData: any = null;

    try {
      if (!token || !id) throw new Error("Not authenticated");

      const file = values.imageFile?.[0];

      // If no image file, just update the category normally
      if (!file) {
        await CategoryApi.update(token, id, {
          name: values.name,
          description: values.description || undefined,
          isActive: values.isActive ?? true,
          parentId: values.parentId || undefined,
        });

        router.push("/admin/categories");
        return;
      }

      // If image file exists, get original data first for potential rollback
      try {
        originalCategoryData = (await CategoryApi.get(token, id)) as any;
      } catch (getError) {
        throw new Error(
          "Something went wrong while accessing the category. Please try again."
        );
      }

      // Update category first
      await CategoryApi.update(token, id, {
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive ?? true,
        parentId: values.parentId || undefined,
      });

      // Try to upload image - if this fails, we'll rollback
      try {
        const uploadRes = (await CategoryApi.uploadImage(
          token,
          id,
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
        // Image upload failed - rollback the category update
        console.error(
          "Image upload failed, rolling back category update:",
          imageError
        );

        try {
          await CategoryApi.update(token, id, {
            name: originalCategoryData.name,
            description: originalCategoryData.description,
            isActive: originalCategoryData.isActive,
            parentId: originalCategoryData.parentId,
          });
        } catch (rollbackError) {
          console.error("Failed to rollback category update:", rollbackError);
        }

        throw new Error(
          "Something went wrong while uploading the image. Please try again."
        );
      }
    } catch (e) {
      console.error("Category update error:", e);

      // Set user-friendly error message
      let errorMessage =
        "Something went wrong while updating the category. Please try again.";

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Category</h1>
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
                Replace Image (Upload File)
              </label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                {...register("imageFile")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. If provided, the file will be uploaded and the
                category will be updated with the returned image URL.
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
