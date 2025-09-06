import { http, unwrap, type ApiEnvelope } from "./http";

export interface CreateAddressPayload {
  province: string;
  district: string;
  city: string;
  street: string;
  addressType: "billing" | "shipping" | "both";
  postalCode?: string;
  addressCategory: "home" | "work" | "other";
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {}

export interface Address {
  id: string;
  province: string;
  district: string;
  city: string;
  street: string;
  addressType: "billing" | "shipping" | "both";
  postalCode?: string;
  addressCategory: "home" | "work" | "other";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const AddressApi = {
  list: async (token: string, userId: string) => {
    const res = await http.get<ApiEnvelope<Address[]>>(`/address`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId },
    });
    return unwrap<Address[]>(res.data);
  },
  create: async (token: string, payload: CreateAddressPayload) => {
    const res = await http.post<ApiEnvelope<Address>>("/address/add", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<Address>(res.data);
  },
  update: async (token: string, id: string, payload: UpdateAddressPayload) => {
    const res = await http.put<ApiEnvelope<Address>>(
      `/address/update/${id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return unwrap<Address>(res.data);
  },
  delete: async (token: string, id: string) => {
    const res = await http.delete<ApiEnvelope<void>>(`/address/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<void>(res.data);
  },
  getById: async (token: string, id: string) => {
    const res = await http.get<ApiEnvelope<Address>>(`/address/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap<Address>(res.data);
  },
};
