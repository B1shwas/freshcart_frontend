import { http, unwrap, type ApiEnvelope } from "./http";

export const UserApi = {
  signup: async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) => {
    const res = await http.post<ApiEnvelope<unknown>>("/user/signup", payload);
    return unwrap<unknown>(res.data);
  },
};
