import { http, unwrap, type ApiEnvelope } from "./http";

export const CategoryApi = {
  // Public route - get all categories
  list: async (params?: Record<string, unknown>) => {
    const res = await http.get<ApiEnvelope<unknown>>("/categories", { params });
    return unwrap<unknown>(res.data);
  },

  // Public route - get root categories
  getRootCategories: async () => {
    const res = await http.get<ApiEnvelope<unknown>>("/categories/root/all");
    return unwrap<unknown>(res.data);
  },

  get: async (token: string, id: string) => {
    const res = await http.get<ApiEnvelope<unknown>>(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
  create: async (
    token: string,
    payload: {
      name: string;
      description?: string;
      image?: string;
      parentId?: string | null;
      isActive?: boolean;
    }
  ) => {
    const res = await http.post<ApiEnvelope<unknown>>("/categories", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
  update: async (
    token: string,
    id: string,
    payload: {
      name?: string;
      description?: string;
      image?: string;
      parentId?: string | null;
      isActive?: boolean;
    }
  ) => {
    const res = await http.patch<ApiEnvelope<unknown>>(
      `/categories/${id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return unwrap<unknown>(res.data);
  },
  remove: async (token: string, id: string) => {
    const res = await http.delete<ApiEnvelope<unknown>>(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
  uploadImage: async (token: string, id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await http.post<ApiEnvelope<unknown>>(
      `/categories/${id}/upload-image`,
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
