import { http, unwrap, type ApiEnvelope } from "./http";

export const AuthApi = {
  login: async (payload: { identifier: string; password: string }) => {
    const res = await http.post<ApiEnvelope<{ accessToken: string }>>(
      "/auth/login",
      payload
    );
    return unwrap<{ accessToken: string }>(res.data);
  },
  me: async (token: string) => {
    const res = await http.get<ApiEnvelope<unknown>>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<unknown>(res.data);
  },
};
