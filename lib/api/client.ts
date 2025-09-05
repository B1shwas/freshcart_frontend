// Axios-based API client tailored to the provided backend (localhost:3001/api)
// - Adds Authorization header when provided
// - Unwraps the conventional { data, status, message } envelope

import axios, { AxiosError, AxiosInstance } from "axios";

export type ApiEnvelope<T> = {
  data: T;
  status: number;
  message: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function unwrap<T>(resData: unknown): T {
  if (
    typeof resData === "object" &&
    resData !== null &&
    Object.prototype.hasOwnProperty.call(resData, "data")
  ) {
    return (resData as ApiEnvelope<T>).data;
  }
  return resData as T;
}

// Auth endpoints aligned with backend
export const AuthApi = {
  login: async (payload: { identifier: string; password: string }) => {
    const res = await api.post<ApiEnvelope<{ accessToken: string }>>(
      "/auth/login",
      payload
    );
    return unwrap<{ accessToken: string }>(res.data);
  },
  me: async (token: string) => {
    const res = await api.get<ApiEnvelope<unknown>>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
};

// User endpoints
export const UserApi = {
  signup: async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) => {
    const res = await api.post<ApiEnvelope<unknown>>("/user/signup", payload);
    return unwrap<unknown>(res.data);
  },
};

// Export low-level client for custom requests in pages (e.g., admin dashboard)
export const http = api;

// Category endpoints
export const CategoryApi = {
  list: async (token: string, params?: Record<string, unknown>) => {
    const res = await api.get<ApiEnvelope<unknown>>("/categories", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return unwrap<unknown>(res.data);
  },
  get: async (token: string, id: string) => {
    const res = await api.get<ApiEnvelope<unknown>>(`/categories/${id}`, {
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
    const res = await api.post<ApiEnvelope<unknown>>("/categories", payload, {
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
    const res = await api.patch<ApiEnvelope<unknown>>(
      `/categories/${id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return unwrap<unknown>(res.data);
  },
  remove: async (token: string, id: string) => {
    const res = await api.delete<ApiEnvelope<unknown>>(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
  uploadImage: async (token: string, id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ApiEnvelope<unknown>>(
      `/categories/${id}/upload-image`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let the browser set proper multipart boundaries
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return unwrap<unknown>(res.data);
  },
};
