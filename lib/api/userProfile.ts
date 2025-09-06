import { http, unwrap, type ApiEnvelope } from "./http";

export interface UserProfilePayload {
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  bio?: string;
  phoneNumber?: string;
  newsletterSubscribed?: boolean;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  bio?: string;
  phoneNumber?: string;
  newsletterSubscribed?: boolean;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const UserProfileApi = {
  get: async (token: string) => {
    const res = await http.get<ApiEnvelope<UserProfile | null>>(
      "/user-profile",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return unwrap<UserProfile | null>(res.data);
  },
  create: async (token: string, payload: UserProfilePayload) => {
    const res = await http.post<ApiEnvelope<UserProfile>>(
      "/user-profile",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return unwrap<UserProfile>(res.data);
  },
  update: async (token: string, payload: UserProfilePayload) => {
    const res = await http.patch<ApiEnvelope<UserProfile>>(
      "/user-profile",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return unwrap<UserProfile>(res.data);
  },
  uploadPicture: async (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await http.post<ApiEnvelope<UserProfile>>(
      "/user-profile/upload-profile-picture",
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return unwrap<UserProfile>(res.data);
  },
  deletePicture: async (token: string) => {
    const res = await http.delete<ApiEnvelope<UserProfile>>(
      "/user-profile/profile-picture",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return unwrap<UserProfile>(res.data);
  },
};
