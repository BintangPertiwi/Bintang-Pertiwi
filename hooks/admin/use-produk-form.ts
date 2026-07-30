import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProdukRow } from "@/types";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";
import { compressImage } from "@/lib/image-compression";
import { generateId } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { produkSchema, type ProdukFormValues } from "@/types/forms";

interface UseProdukFormProps {
  existingCategories: string[];
  initialData?: ProdukRow;
  defaultWa?: string;
  onSuccess?: () => void;
}

export interface ProdukImage {
  key: string;
  file?: File;
  previewUrl: string;
  existingUrl?: string;
}

const MAX_IMAGE_SIZE_MB = 4;
const MAX_IMAGES = 6;

export function useProdukForm({ existingCategories, initialData, defaultWa, onSuccess }: UseProdukFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<ProdukImage[]>(
    () => (initialData?.gambar_urls ?? []).map((url) => ({ key: generateId(6), previewUrl: url, existingUrl: url }))
  );

  const mode: "create" | "edit" = initialData ? "edit" : "create";
  const allCategories = useMemo(
    () => Array.from(new Set([...existingCategories, ...customCategories])),
    [existingCategories, customCategories]
  );

  const form = useForm<ProdukFormValues>({
    resolver: zodResolver(produkSchema),
    values: {
      nama: initialData?.nama || "",
      kategori: initialData?.kategori || "",
      harga: initialData?.harga !== undefined ? String(initialData.harga) : "",
      harga_coret: initialData?.harga_coret !== undefined ? String(initialData.harga_coret) : "",
      satuan: initialData?.satuan || "",
      stok: initialData?.stok || "Tersedia",
      deskripsi_singkat: initialData?.deskripsi_singkat || "",
      deskripsi_lengkap: initialData?.deskripsi_lengkap || "",
      informasi_tambahan: initialData?.informasi_tambahan || "",
      sku: initialData?.sku || "",
      varian: initialData?.varian?.join(", ") || "",
      tags: initialData?.tags?.join(", ") || "",
      nomor_wa: initialData?.nomor_wa || defaultWa || "",
    },
  });

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.previewUrl.startsWith("blob:")) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, []);

  const addFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const validImages: ProdukImage[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" bukan file gambar.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" melebihi ukuran maksimal 4 MB.`);
        continue;
      }
      validImages.push({ key: generateId(6), file, previewUrl: URL.createObjectURL(file) });
    }

    if (validImages.length === 0) return;

    setImages((prev) => {
      const combined = [...prev, ...validImages];
      if (combined.length > MAX_IMAGES) {
        toast.error(`Maksimal ${MAX_IMAGES} gambar per produk.`);
        combined.slice(MAX_IMAGES).forEach((img) => {
          if (img.previewUrl.startsWith("blob:")) URL.revokeObjectURL(img.previewUrl);
        });
        return combined.slice(0, MAX_IMAGES);
      }
      return combined;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.key === key);
      if (target?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.key !== key);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleCancel = () => {
    form.reset();
    router.push("/admin/produk");
  };

  const onSubmit = async (values: ProdukFormValues) => {
    if (images.length === 0) {
      toast.error("Harap unggah minimal satu gambar produk.");
      return;
    }

    setIsLoading(true);
    const newlyUploaded: string[] = [];

    try {
      const gambar_urls: string[] = [];
      for (const img of images) {
        if (img.existingUrl) {
          gambar_urls.push(img.existingUrl);
        } else if (img.file) {
          const compressed = await compressImage(img.file);
          const url = await uploadToCloudinary(compressed);
          newlyUploaded.push(url);
          gambar_urls.push(url);
        }
      }

      const tags = (values.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const varian = (values.varian || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      const endpoint = mode === "edit" && initialData ? `/api/produk/${initialData.id}` : "/api/produk";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: values.nama.trim(),
          kategori: values.kategori.trim(),
          harga: Number.parseInt(values.harga, 10),
          harga_coret: values.harga_coret ? Number.parseInt(values.harga_coret, 10) : undefined,
          satuan: values.satuan?.trim() || "",
          stok: values.stok,
          deskripsi_singkat: values.deskripsi_singkat.trim(),
          deskripsi_lengkap: values.deskripsi_lengkap?.trim() || "",
          informasi_tambahan: values.informasi_tambahan?.trim() || "",
          sku: values.sku?.trim() || "",
          varian,
          tags,
          gambar_urls,
          nomor_wa: values.nomor_wa?.trim() || "",
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message || `Gagal ${mode === "edit" ? "memperbarui" : "menyimpan"} produk.`);
      }

      toast.success(`Produk berhasil ${mode === "edit" ? "diperbarui" : "ditambahkan"}!`);

      form.reset();
      setImages([]);

      onSuccess?.();
      router.push("/admin/produk");
      router.refresh();
    } catch (error) {
      console.error(error);
      if (newlyUploaded.length > 0) {
        await Promise.allSettled(newlyUploaded.map((url) => deleteUploadedCloudinaryImage(url)));
      }
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    comboboxOpen,
    setComboboxOpen,
    search,
    setSearch,
    customCategories,
    setCustomCategories,
    isDragging,
    images,
    mode,
    allCategories,
    maxImages: MAX_IMAGES,
    handleFileChange,
    removeImage,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCancel,
    onSubmit,
  };
}
