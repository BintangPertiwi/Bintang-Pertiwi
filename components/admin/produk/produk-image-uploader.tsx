"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { ProdukImage } from "@/hooks/admin/use-produk-form";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface ProdukImageUploaderProps {
  images: ProdukImage[];
  isDragging: boolean;
  maxImages: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (key: string) => void;
  onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
}

export function ProdukImageUploader({
  images,
  isDragging,
  maxImages,
  onFileChange,
  onRemove,
  onDragOver,
  onDragLeave,
  onDrop,
}: ProdukImageUploaderProps) {
  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        Gambar Produk <span className="text-red-500 ml-0.5">*</span>
      </Label>
      <p className="text-xs text-muted-foreground">
        Gambar pertama menjadi thumbnail. Maksimal {maxImages} gambar (masing-masing ≤ 4 MB).
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
        {images.map((img, index) => (
          <div
            key={img.key}
            className="relative aspect-square rounded-md overflow-hidden border border-border bg-muted group"
          >
            <Image
              src={img.previewUrl}
              alt={`Gambar produk ${index + 1}`}
              fill
              className="object-cover"
              unoptimized={img.previewUrl.startsWith("blob:")}
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            {index === 0 && (
              <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                Utama
              </Badge>
            )}
            <button
              type="button"
              onClick={() => onRemove(img.key)}
              className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Hapus gambar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <label
            htmlFor="produk-image-input"
            className={cn(
              "flex aspect-square flex-col items-center justify-center rounded-md border border-dashed cursor-pointer transition-all text-center p-3",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-transparent hover:border-slate-400/80 hover:bg-muted"
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <ImagePlus className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-[13px] text-muted-foreground">Tambah / Geser gambar</span>
            <input
              id="produk-image-input"
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={onFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
