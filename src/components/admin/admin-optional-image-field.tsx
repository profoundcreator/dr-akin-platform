"use client";

import { Eye, EyeOff, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadHint } from "@/components/ui/image-upload-hint";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  hideLabel?: string;
  showLabel?: string;
  optionalNote?: string;
  imageHidden?: boolean;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  onToggleHidden?: () => void;
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
  hideLabel = "Hide image",
  showLabel = "Show image",
  optionalNote = "Optional — hide temporarily or remove to clear the image from this page.",
  imageHidden = false,
  onFileSelect,
  onRemove,
  onToggleHidden,
}: AdminOptionalImageFieldProps) {
  const hasImage = Boolean(previewUrl);

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
        {hasImage && (
          <>
            <div className="relative">
              <img
                src={previewUrl!}
                alt=""
                className={cn(previewClassName, imageHidden && "opacity-45 grayscale-[20%]")}
              />
              {imageHidden && (
                <span className="absolute inset-x-0 bottom-0 rounded-b-md bg-[var(--ploy-background-inverse)]/75 px-1 py-0.5 text-center text-[0.625rem] font-medium uppercase tracking-wide text-[var(--ploy-text-inverse)]">
                  Hidden
                </span>
              )}
            </div>
            {onToggleHidden && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={onToggleHidden}
              >
                {imageHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {imageHidden ? showLabel : hideLabel}
              </Button>
            )}
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
