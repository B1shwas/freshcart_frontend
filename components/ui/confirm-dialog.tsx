"use client";

import React from "react";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  itemDescription?: string; // Optional item preview
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  itemDescription,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>

        {itemDescription && (
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <p className="text-sm text-gray-700">{itemDescription}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""
            }
          >
            {loading ? "Working..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
