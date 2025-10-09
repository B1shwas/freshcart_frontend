import { http, unwrap, type ApiEnvelope } from "./http";

export type ProductListParams = {
  categoryId?: string;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
};

export type FeaturedProductsParams = {
  limit?: number;
};

export type RelatedProductsParams = {
  limit?: number;
};

export type Unit = "kg" | "g" | "l" | "ml" | "pc" | "dozen" | "pack" | "bundle";

export type ProductPayload = {
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  categoryId: string;
  stockQuantity: number;
  unit: Unit;
  isActive?: boolean;
  tags?: string[];
  imageUrls?: string[];
  thumbnailUrl?: string;
  isFeatured?: boolean;
};

export const ProductApi = {
  create: async (token: string, payload: ProductPayload) => {
    const res = await http.post<ApiEnvelope<unknown>>("/products", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
  list: async (params?: ProductListParams) => {
    const res = await http.get<ApiEnvelope<unknown>>("/products", { params });
    return unwrap<unknown>(res.data);
  },
  get: async (id: string) => {
    const res = await http.get<ApiEnvelope<unknown>>(`/products/${id}`);
    return unwrap<unknown>(res.data);
  },
  update: async (
    token: string,
    id: string,
    payload: Partial<ProductPayload>
  ) => {
    const res = await http.patch<ApiEnvelope<unknown>>(
      `/products/${id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return unwrap<unknown>(res.data);
  },
  remove: async (token: string, id: string) => {
    const res = await http.delete<ApiEnvelope<unknown>>(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
  featuredAll: async (params?: FeaturedProductsParams) => {
    const res = await http.get<ApiEnvelope<unknown>>("/products/featured/all", {
      params,
    });
    return unwrap<unknown>(res.data);
  },
  related: async (id: string, params?: RelatedProductsParams) => {
    const res = await http.get<ApiEnvelope<unknown>>(
      `/products/${id}/related`,
      { params }
    );
    return unwrap<unknown>(res.data);
  },
  updateStock: async (token: string, id: string, stockQuantity: number) => {
    const res = await http.patch<ApiEnvelope<unknown>>(
      `/products/${id}/stock`,
      { stockQuantity },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return unwrap<unknown>(res.data);
  },
  uploadImages: async (
    token: string,
    id: string,
    files: File[],
    options?: { isThumbnail?: boolean }
  ) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (options?.isThumbnail !== undefined) {
      form.append("isThumbnail", String(options.isThumbnail));
    }
    const res = await http.post<ApiEnvelope<unknown>>(
      `/products/${id}/upload-images`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return unwrap<unknown>(res.data);
  },
};
