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
