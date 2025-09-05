// Lightweight API client tailored to the provided backend (localhost:3001/api)
// - Adds Authorization header when token is provided
// - Parses the conventional { data, status, message } response envelope

export type ApiEnvelope<T> = {
  data: T;
  status: number;
  message: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    // if the endpoint doesn't use the {data} envelope, set raw=true
    raw?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, token, headers = {}, raw = false } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    // include credentials only if your API needs cookies; disabled here
  });

  // Attempt to parse JSON; if it fails, throw a generic error
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // ignore, will handle below
  }

  if (!res.ok) {
    const msg =
      isRecord(json) && typeof json.message === "string"
        ? json.message
        : res.statusText || "Request failed";
    throw new ApiError(String(msg), res.status, json);
  }

  if (raw) return json as T;
  // Default: unwrap { data }
  if (typeof json === "object" && json !== null && "data" in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

// Helpers
class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Auth endpoints aligned with backend
export const AuthApi = {
  login: (payload: { identifier: string; password: string }) =>
    apiFetch<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: payload,
      raw: false,
    }),
  me: (token: string) =>
    apiFetch<unknown>("/auth/me", {
      method: "GET",
      token,
      raw: false,
    }),
};

// User endpoints
export const UserApi = {
  signup: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) =>
    apiFetch<unknown>("/user/signup", {
      method: "POST",
      body: payload,
      raw: false,
    }),
};
