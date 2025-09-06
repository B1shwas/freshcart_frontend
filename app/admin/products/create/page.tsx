"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  isActive?: boolean;
  isFeatured?: boolean;
  discountPercentage?: number;
  tags?: string; // comma-separated input -> array for API
  thumbnail?: FileList;
  gallery?: FileList;
};

export default function CreateProductPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    getValues,
  } = useForm<FormValues>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const loadCats = async () => {
      setLoadingCats(true);
      setCatsError(null);
      try {
        const data = (await CategoryApi.list(token, {
          limit: 1000,
          isActive: true,
        })) as any;
        const items: Category[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        if (!cancelled) setCategories(items);
      } catch (e) {
        if (!cancelled)
          setCatsError(
            e instanceof Error ? e.message : "Failed to load categories"
          );
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    };
    loadCats();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = async (values: FormValues) => {
    let createdProductId: string | null = null;
    try {
      if (!token) throw new Error("Not authenticated");
      // 1) Create product (without images)
      const created = (await ProductApi.create(token, {
        name: values.name,
        description: values.description,
        price: values.price,
        discountedPrice: values.discountedPrice || undefined,
        discountPercentage: values.discountPercentage || undefined,
        categoryId: values.categoryId,
        stockQuantity: values.stockQuantity,
        unit: values.unit,
        isActive: values.isActive,
        isFeatured: values.isFeatured ?? false,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      })) as any;

      const productId: string | undefined =
        created?.id ||
        created?._id ||
        created?.product?.id ||
        created?.data?.id;
      if (!productId)
        throw new Error("Product created but id not found in response");
      createdProductId = productId;

      // 2+3) Build uploads and run all-or-nothing
      const promises: Promise<any>[] = [];
      const thumbFile = values.thumbnail?.[0];
      if (thumbFile) {
        promises.push(
          ProductApi.uploadImages(token, productId, [thumbFile], {
            isThumbnail: true,
          })
        );
      }

      const galleryToUpload = galleryFiles.length
        ? galleryFiles
        : values.gallery
        ? Array.from(values.gallery)
        : [];
      if (galleryToUpload.length) {
        promises.push(
          ProductApi.uploadImages(token, productId, galleryToUpload, {
            isThumbnail: false,
          })
        );
      }

      // If any upload fails, we rollback by deleting the created product
      if (promises.length) {
        await Promise.all(promises);
      }

      router.push("/admin/products");
    } catch (e) {
      // Attempt rollback if product was created but later step failed
      if (createdProductId && token) {
        try {
          await ProductApi.remove(token, createdProductId);
        } catch {
          // swallow rollback failure; surface original error instead
        }
      }
      setError("root", { message: e instanceof Error ? e.message : "Failed" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Product</h1>
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
                {...register("discountedPrice", {
                  valueAsNumber: true,
                  validate: (v) => {
                    if (v === undefined || v === null || Number.isNaN(v))
                      return true;
                    const price = getValues("price");
                    if (typeof price !== "number" || Number.isNaN(price))
                      return true;
                    return v <= price || "Discounted price must be <= price";
                  },
                })}
              />
              {errors.discountedPrice && (
                <p className="text-xs text-red-500">
                  {errors.discountedPrice.message as any}
                </p>
              )}
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
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="categoryId">
                Category
              </label>
              {catsError && (
                <div className="text-xs text-red-600 mb-1">{catsError}</div>
              )}
              <select
                id="categoryId"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("categoryId", {
                  required: "Category is required",
                })}
                disabled={loadingCats}
              >
                <option value="">
                  {loadingCats ? "Loading..." : "Select category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                {!loadingCats && categories.length === 0 && (
                  <option disabled value="">
                    No categories found
                  </option>
                )}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-500">
                  {errors.categoryId.message as any}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="unit">
                Unit
              </label>
              <select
                id="unit"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("unit", { required: "Unit is required" })}
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
              {errors.unit && (
                <p className="text-xs text-red-500">
                  {errors.unit.message as any}
                </p>
              )}
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
            <div className="col-span-full">
              <label className="text-sm font-medium" htmlFor="tags">
                Tags (comma-separated)
              </label>
              <Input
                id="tags"
                placeholder="organic, fruit, fresh"
                {...register("tags")}
              />
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
                accept="image/png, image/jpeg, .png, .jpg, .jpeg"
                {...register("thumbnail", {
                  validate: (files: FileList | undefined) => {
                    if (!files || files.length === 0) return true;
                    const f = files[0];
                    const ok = ["image/png", "image/jpeg"].includes(f.type);
                    return ok || "Only PNG or JPEG images are allowed";
                  },
                })}
              />
              {errors.thumbnail && (
                <p className="text-xs text-red-500">
                  {errors.thumbnail.message as any}
                </p>
              )}
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
                accept="image/png, image/jpeg, .png, .jpg, .jpeg"
                multiple
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  const allowed = files.filter((f) =>
                    ["image/png", "image/jpeg"].includes(f.type)
                  );
                  if (allowed.length !== files.length) {
                    setError("gallery", {
                      message: "Only PNG or JPEG images are allowed",
                    });
                  } else {
                    clearErrors("gallery");
                  }
                  if (allowed.length) {
                    setGalleryFiles((prev) => [...prev, ...allowed]);
                  }
                  // allow re-selecting the same file
                  e.currentTarget.value = "";
                }}
              />
              {errors.gallery && (
                <p className="text-xs text-red-500">
                  {errors.gallery.message as any}
                </p>
              )}
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
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
