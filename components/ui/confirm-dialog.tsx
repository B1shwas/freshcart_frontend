"use client";

import React from "react";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-md border bg-background p-4 shadow-lg">
        <h2 className="text-base font-semibold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            className="cursor-pointer"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
