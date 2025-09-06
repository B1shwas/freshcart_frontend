"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { CategoryApi, ProductApi } from "@/lib/api/client";
import type { Category } from "@/types/api";

type FormValues = {
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  categoryId: string;
  stockQuantity: number;
  unit: "kg" | "g" | "l" | "ml" | "pc" | "dozen" | "pack" | "bundle";
  isFeatured?: boolean;
  discountPercentage?: number;
  thumbnail?: FileList;
  gallery?: FileList;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const { token, isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin) router.replace("/");
  }, [isAuthenticated, isAdmin, router]);

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
      } catch {
      } finally {
        setLoadingCats(false);
      }
    };
    loadCats();
  }, [token]);

  useEffect(() => {
    const load = async () => {
      try {
        const p = (await ProductApi.get(id)) as any;
        reset({
          name: p.name,
          description: p.description,
          price: p.price,
          discountedPrice: p.discountedPrice,
          categoryId: p.categoryId || p.category?.id,
          stockQuantity: p.stockQuantity ?? p.stock,
          unit: p.unit,
          isFeatured: p.isFeatured,
          discountPercentage: p.discountPercentage ?? p.discount,
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
  }, [id, reset, setError]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!token) throw new Error("Not authenticated");
      await ProductApi.update(token, id, {
        name: values.name,
        description: values.description,
        price: values.price,
        discountedPrice: values.discountedPrice || undefined,
        categoryId: values.categoryId,
        stockQuantity: values.stockQuantity,
        unit: values.unit,
        isFeatured: values.isFeatured ?? false,
        discountPercentage: values.discountPercentage || undefined,
      });

      const thumb = values.thumbnail?.[0];
      if (thumb) {
        await ProductApi.uploadImages(token, id, [thumb], {
          isThumbnail: true,
        });
      }
      const galleryToUpload = galleryFiles.length
        ? galleryFiles
        : values.gallery
        ? Array.from(values.gallery)
        : [];
      if (galleryToUpload.length) {
        // Clear existing gallery first so backend replaces instead of appends
        try {
          await ProductApi.update(token, id, { imageUrls: [] } as any);
        } catch {
          // if clearing fails, continue; backend may still overwrite
        }
        await ProductApi.uploadImages(token, id, galleryToUpload, {
          isThumbnail: false,
        });
      }
      router.push("/admin/products");
    } catch (e) {
      setError("root", { message: e instanceof Error ? e.message : "Failed" });
    }
  };

  const onUpdateStock = async () => {
    try {
      if (!token) return;
      const qtyStr = prompt("New stock quantity?");
      if (!qtyStr) return;
      const qty = Number(qtyStr);
      if (Number.isNaN(qty)) return alert("Invalid number");
      await ProductApi.updateStock(token, id, qty);
      reset((prev) => ({ ...prev, stockQuantity: qty } as any));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update stock");
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
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link href="/admin/products">
          <Button variant="outline" className="cursor-pointer">
            Back
          </Button>
        </Link>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {errors.root?.message && (
              <div className="col-span-full bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {errors.root.message}
              </div>
            )}

            <div className="col-span-full">
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

            <div className="col-span-full">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Input
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="price">
                Price
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", {
                  valueAsNumber: true,
                  required: true,
                  min: { value: 0.01, message: "Price must be positive" },
                })}
              />
              {errors.price && (
                <p className="text-xs text-red-500">
                  {errors.price.message as any}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="discountedPrice">
                Discounted Price
              </label>
              <Input
                id="discountedPrice"
                type="number"
                step="0.01"
                {...register("discountedPrice", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="stockQuantity">
                Stock Quantity
              </label>
              <Input
                id="stockQuantity"
                type="number"
                {...register("stockQuantity", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Stock cannot be negative" },
                })}
              />
              {errors.stockQuantity && (
                <p className="text-xs text-red-500">
                  {errors.stockQuantity.message as any}
                </p>
              )}
              <Button
                type="button"
                size="sm"
                className="mt-2 cursor-pointer"
                onClick={onUpdateStock}
              >
                Quick Update Stock
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="categoryId">
                Category
              </label>
              <select
                id="categoryId"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("categoryId", { required: true })}
                disabled={loadingCats}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="unit">
                Unit
              </label>
              <select
                id="unit"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("unit", { required: true })}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="pc">pc</option>
                <option value="dozen">dozen</option>
                <option value="pack">pack</option>
                <option value="bundle">bundle</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isFeatured"
                type="checkbox"
                className="cursor-pointer"
                {...register("isFeatured")}
              />
              <label htmlFor="isFeatured" className="text-sm cursor-pointer">
                Featured
              </label>
            </div>

            <div>
              <label
                className="text-sm font-medium"
                htmlFor="discountPercentage"
              >
                Discount Percentage (%)
              </label>
              <Input
                id="discountPercentage"
                type="number"
                step="0.01"
                {...register("discountPercentage", {
                  valueAsNumber: true,
                  min: 0,
                  max: 100,
                })}
              />
            </div>

            <div className="col-span-full">
              <label className="text-sm font-medium" htmlFor="thumbnail">
                Thumbnail
              </label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                {...register("thumbnail")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. If provided, uploaded as thumbnail.
              </p>
            </div>

            <div className="col-span-full">
              <label className="text-sm font-medium" htmlFor="gallery">
                Gallery Images
              </label>
              <input
                id="gallery"
                type="file"
                accept="image/*"
                multiple
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setGalleryFiles((prev) => [...prev, ...files]);
                  e.currentTarget.value = "";
                }}
              />
              {galleryFiles.length > 0 && (
                <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                  {galleryFiles.map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="truncate max-w-[75%]">{f.name}</span>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() =>
                          setGalleryFiles((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Optional. You can select multiple images for gallery.
              </p>
            </div>

            <div className="col-span-full">
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
