"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import {
  AddressApi,
  type Address,
  type CreateAddressPayload,
} from "@/lib/api/address";
import {
  MapPin,
  Home,
  Building,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

interface AddressFormData {
  province: string;
  district: string;
  city: string;
  street: string;
  addressType: "billing" | "shipping" | "both";
  postalCode?: string;
  addressCategory: "home" | "work" | "other";
}

interface AddressManagerProps {
  token: string;
}

export default function AddressManager({ token }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    addressId: string | null;
    addressText: string;
  }>({ show: false, addressId: null, addressText: "" });
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>();

  const loadAddresses = async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await AddressApi.list(token, user.id);
      setAddresses(data || []);
    } catch (e) {
      // Silently handle address not found - don't show error to user
      // Only show error for actual failures, not empty address lists
      if (
        e instanceof Error &&
        !e.message.includes("404") &&
        !e.message.includes("not found")
      ) {
        setError(e.message);
      }
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [token, user?.id]);

  const onSubmit = async (values: AddressFormData) => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await AddressApi.update(token, editingId, values);
        setSuccess("Address updated successfully");
      } else {
        await AddressApi.create(token, values);
        setSuccess("Address added successfully");
      }
      await loadAddresses();
      setShowForm(false);
      setEditingId(null);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setShowForm(true);
    reset({
      province: address.province,
      district: address.district,
      city: address.city,
      street: address.street,
      addressType: address.addressType,
      postalCode: address.postalCode || "",
      addressCategory: address.addressCategory,
    });
  };

  const handleDelete = async () => {
    if (!token || !deleteModal.addressId) return;
    try {
      await AddressApi.delete(token, deleteModal.addressId);
      setSuccess("Address deleted successfully");
      await loadAddresses();
      setDeleteModal({ show: false, addressId: null, addressText: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleteModal({ show: false, addressId: null, addressText: "" });
    }
  };

  const openDeleteModal = (address: Address) => {
    setDeleteModal({
      show: true,
      addressId: address.id,
      addressText: formatAddress(address),
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "work":
        return <Building className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.district}, ${
      address.province
    }${address.postalCode ? ` - ${address.postalCode}` : ""}`;
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Addresses
          </CardTitle>
          {!showForm && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                reset();
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Address
            </Button>
          )}
        </div>
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

        {/* Address Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-6 p-4 border rounded-lg bg-gray-50"
          >
            <h3 className="text-sm font-medium mb-4">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium" htmlFor="province">
                  Province
                </label>
                <Input
                  id="province"
                  {...register("province", {
                    required: "Province is required",
                  })}
                />
                {errors.province && (
                  <p className="text-xs text-red-500">
                    {errors.province.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="district">
                  District
                </label>
                <Input
                  id="district"
                  {...register("district", {
                    required: "District is required",
                  })}
                />
                {errors.district && (
                  <p className="text-xs text-red-500">
                    {errors.district.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="city">
                  City
                </label>
                <Input
                  id="city"
                  {...register("city", { required: "City is required" })}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="postalCode">
                  Postal Code
                </label>
                <Input id="postalCode" {...register("postalCode")} />
              </div>
              <div className="col-span-full">
                <label className="text-sm font-medium" htmlFor="street">
                  Street Address
                </label>
                <Input
                  id="street"
                  {...register("street", { required: "Street is required" })}
                />
                {errors.street && (
                  <p className="text-xs text-red-500">
                    {errors.street.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  htmlFor="addressCategory"
                >
                  Category
                </label>
                <select
                  id="addressCategory"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("addressCategory", {
                    required: "Category is required",
                  })}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="addressType">
                  Type
                </label>
                <select
                  id="addressType"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("addressType", { required: "Type is required" })}
                >
                  <option value="shipping">Shipping</option>
                  <option value="billing">Billing</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update" : "Add Address"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Address List */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          !showForm && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-4">
                No delivery addresses yet
              </p>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setShowForm(true)}
              >
                Add Your First Address
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1 text-blue-600">
                    {getCategoryIcon(address.addressCategory)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium capitalize">
                        {address.addressCategory}
                      </p>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">
                        {address.addressType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatAddress(address)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-red-600 hover:text-red-800"
                    onClick={() => openDeleteModal(address)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Address</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this address?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="text-sm text-gray-700">{deleteModal.addressText}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteModal({
                    show: false,
                    addressId: null,
                    addressText: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
