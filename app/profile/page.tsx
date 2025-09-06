"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { UserProfileApi } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/userProfile";
import { isAxiosError } from "axios";
import AddressManager from "@/components/address-manager";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";

interface ProfileForm {
  fullName: string;
  gender?: string;
  dateOfBirth?: string; // yyyy-mm-dd
  preferredLanguage?: string;
  bio?: string;
  phoneNumber?: string;
  newsletterSubscribed?: boolean;
  image?: FileList;
}

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, setUser, isAuthenticated } = useAuthStore();
  const { isInitialized } = useAuthInitialization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>();

  useEffect(() => {
    // Wait for auth to be initialized before checking authentication
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!token) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await UserProfileApi.get(token);
        if (cancelled) return;
        if (data) {
          setProfileExists(true);
          setProfile(data);
          reset({
            fullName: data.fullName || "",
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth
              ? data.dateOfBirth.substring(0, 10)
              : "",
            preferredLanguage: data.preferredLanguage || "",
            bio: data.bio || "",
            phoneNumber: data.phoneNumber || "",
            newsletterSubscribed: data.newsletterSubscribed ?? false,
          });
        } else {
          setProfileExists(false);
          setEditing(true); // Auto-edit mode if no profile
          reset({ fullName: "" });
        }
      } catch (e: any) {
        if (cancelled) return;
        if (isAxiosError(e) && e.response?.status === 404) {
          // Stop loading immediately and show setup prompt
          setProfileExists(false);
          setEditing(true); // Auto-edit mode if no profile
          reset({ fullName: "" });
        } else {
          setError(e instanceof Error ? e.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isInitialized, isAuthenticated, token, reset, setUser, user, router]);

  const onSubmit = async (values: ProfileForm) => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        fullName: values.fullName,
        gender: values.gender || undefined,
        dateOfBirth: values.dateOfBirth
          ? new Date(values.dateOfBirth + "T00:00:00Z").toISOString()
          : undefined,
        preferredLanguage: values.preferredLanguage || undefined,
        bio: values.bio || undefined,
        phoneNumber: values.phoneNumber || undefined,
        newsletterSubscribed: values.newsletterSubscribed ?? false,
      };
      let resp: UserProfile;
      if (profileExists) {
        resp = await UserProfileApi.update(token, payload);
        setSuccess("Profile updated");
      } else {
        resp = await UserProfileApi.create(token, payload);
        setProfileExists(true);
        setSuccess("Profile created");
      }
      setProfile(resp);
      setEditing(false); // Exit edit mode after save

      // Conditional image upload if user selected one in the form
      const imageFile = values.image?.[0];
      if (imageFile) {
        try {
          const updated = await UserProfileApi.uploadPicture(token, imageFile);
          setProfile(updated);
          setSuccess((prev) =>
            prev ? prev + " & image uploaded" : "Image uploaded"
          );
        } catch (imgErr) {
          setError(
            imgErr instanceof Error
              ? `Profile saved but image failed: ${imgErr.message}`
              : "Profile saved but image upload failed"
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // removed old standalone image upload/delete handlers

  if (!isInitialized || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex gap-3">
          {profileExists && !editing && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          )}
          {user?.role === "admin" && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push("/admin")}
            >
              Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Profile Display Mode */}
      {profileExists && !editing && profile && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <div className="col-span-full flex items-center gap-6">
                {profile.profilePicture ? (
                  <img
                    src={`http://localhost:3001${profile.profilePicture}`}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                    <span className="text-gray-500 text-2xl font-bold">
                      {profile.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">{profile.fullName}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Gender
                  </label>
                  <p className="text-sm capitalize">
                    {profile.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date of Birth
                  </label>
                  <p className="text-sm">
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Language
                  </label>
                  <p className="text-sm">
                    {profile.preferredLanguage || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <p className="text-sm">
                    {profile.phoneNumber || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Newsletter
                  </label>
                  <p className="text-sm">
                    {profile.newsletterSubscribed
                      ? "Subscribed"
                      : "Not subscribed"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Member Since
                  </label>
                  <p className="text-sm">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              {profile.bio && (
                <div className="col-span-full">
                  <label className="text-sm font-medium text-gray-600">
                    Bio
                  </label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Edit Form */}
      {(editing || !profileExists) && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">
              {profileExists ? "Edit Profile" : "Create Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
            {!profileExists && !error && (
              <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">Set up your profile</p>
                <p>
                  We couldn&apos;t find a profile for your account. Complete the
                  form below to create one.
                </p>
              </div>
            )}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="col-span-full">
                <label className="text-sm font-medium" htmlFor="fullName">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="col-span-full">
                <label className="text-sm font-medium" htmlFor="image">
                  Profile Image (optional)
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("image")}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  If selected, image uploads after saving the profile.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("gender")}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="dateOfBirth">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  htmlFor="preferredLanguage"
                >
                  Language
                </label>
                <Input
                  id="preferredLanguage"
                  placeholder="en"
                  {...register("preferredLanguage")}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="phoneNumber">
                  Phone
                </label>
                <Input
                  id="phoneNumber"
                  placeholder="+123..."
                  {...register("phoneNumber")}
                />
              </div>
              <div className="col-span-full">
                <label className="text-sm font-medium" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  {...register("bio")}
                />
              </div>
              <div className="flex items-center space-x-2 col-span-full">
                <input
                  id="newsletterSubscribed"
                  type="checkbox"
                  className="cursor-pointer"
                  {...register("newsletterSubscribed")}
                />
                <label
                  htmlFor="newsletterSubscribed"
                  className="text-sm cursor-pointer"
                >
                  Subscribe to newsletter
                </label>
              </div>
              <div className="col-span-full flex gap-3">
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={saving}
                >
                  {saving ? "Saving..." : profileExists ? "Update" : "Create"}
                </Button>
                {profileExists && (
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address Management Section - Only for non-admin users */}
      {user?.role !== "admin" && (
        <div className="mt-6">
          <AddressManager token={token || ""} />
        </div>
      )}
    </div>
  );
}
