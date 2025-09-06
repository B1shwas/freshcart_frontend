import axios, { AxiosInstance } from "axios";

export type ApiEnvelope<T> = {
  data: T;
  status: number;
  message: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export function unwrap<T>(resData: unknown): T {
  if (
    typeof resData === "object" &&
    resData !== null &&
    Object.prototype.hasOwnProperty.call(resData, "data")
  ) {
    return (resData as ApiEnvelope<T>).data;
  }
  return resData as T;
}
