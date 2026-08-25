"use client";

import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadHint } from "@/components/ui/image-upload-hint";
import { Label } from "@/components/ui/label";

interface AdminOptionalImageFieldProps {
  id: string;
  label: string;
  hint?: string;
  accept?: string;
  previewUrl: string | null;
  previewClassName?: string;
  disabled?: boolean;
  uploadLabel?: string;
  removeLabel?: string;
  optionalNote?: string;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
}

export function AdminOptionalImageField({
  id,
  label,
  hint,
  accept = "image/jpeg,image/png,image/webp",
  previewUrl,
  previewClassName = "h-16 w-24 rounded-md object-cover",
  disabled = false,
  uploadLabel = "Upload image",
  removeLabel = "Remove image",
  optionalNote = "Optional — remove to show the page without a hero image.",
  onFileSelect,
  onRemove,
}: AdminOptionalImageFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`inline-flex items-center gap-2 rounded-[var(--ploy-radius-button)] border border-[var(--ploy-border-primary)] px-4 py-2 text-sm font-medium ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <ImagePlus className="size-4" />
          {uploadLabel}
          <input
            id={id}
            type="file"
            accept={accept}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
          />
        </label>
        {previewUrl && (
          <>
            <img src={previewUrl} alt="" className={previewClassName} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={onRemove}
            >
              <X className="size-4" />
              {removeLabel}
            </Button>
          </>
        )}
      </div>
      {hint && <ImageUploadHint hint={hint} />}
      {optionalNote && (
        <p className="text-xs text-[var(--ploy-text-tertiary)]">{optionalNote}</p>
      )}
    </div>
  );
}
