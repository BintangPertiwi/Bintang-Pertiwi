import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GaleriRow } from "@/types";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { galeriSchema, type GaleriFormValues } from "@/types/forms";

interface UseGaleriFormProps {
  existingCategories: string[];
  initialData?: GaleriRow;
  onSuccess?: () => void;
}

const MAX_IMAGE_SIZE_MB = 4;

export function useGaleriForm({ existingCategories, initialData, onSuccess }: UseGaleriFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const mode: "create" | "edit" = initialData ? "edit" : "create";
  const selectedPreview = preview || initialData?.url_foto || null;
  const allCategories = useMemo(
    () => Array.from(new Set([...existingCategories, ...customCategories])),
    [existingCategories, customCategories]
  );

  const form = useForm<GaleriFormValues>({
    resolver: zodResolver(galeriSchema),
    values: {
      judul: initialData?.judul || "",
      kategori: initialData?.kategori || "",
      deskripsi: initialData?.deskripsi || "",
    },
  });

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetPreview = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0];
    if (!nextFile) return;

    if (!nextFile.type.startsWith("image/")) {
      toast.error("Harap unggah file gambar.");
      return;
    }

    if (nextFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 4 MB.");
      return;
    }

    resetPreview();
    form.setValue("foto", nextFile, { shouldValidate: true });
    setPreview(URL.createObjectURL(nextFile));
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

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!droppedFile.type.startsWith("image/")) {
      toast.error("Harap unggah file gambar.");
      return;
    }

    if (droppedFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 4 MB.");
      return;
    }

    resetPreview();
    form.setValue("foto", droppedFile, { shouldValidate: true });
    setPreview(URL.createObjectURL(droppedFile));
  };

  const handleCancel = () => {
    form.reset();
    resetPreview();
    router.push("/admin/galeri");
  };

  const onSubmit = async (values: GaleriFormValues) => {
    if (mode === "create" && !values.foto) {
      toast.error("Harap unggah foto terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    let uploadedImageUrl = "";

    try {
      let url_foto = initialData?.url_foto || "";
      if (values.foto) {
        url_foto = await uploadToCloudinary(values.foto);
        uploadedImageUrl = url_foto;
      }

      const endpoint = mode === "edit" && initialData ? `/api/galeri/${initialData.id}` : "/api/galeri";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: values.judul.trim(),
          kategori: values.kategori.trim(),
          deskripsi: values.deskripsi?.trim() || "",
          url_foto,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message || `Gagal ${mode === "edit" ? "memperbarui" : "menyimpan"} galeri.`);
      }

      toast.success(`Galeri berhasil ${mode === "edit" ? "diperbarui" : "ditambahkan"}!`);

      form.reset();
      resetPreview();

      onSuccess?.();
      router.push("/admin/galeri");
      router.refresh();
    } catch (error) {
      console.error(error);
      if (uploadedImageUrl) {
        await deleteUploadedCloudinaryImage(uploadedImageUrl).catch((rollbackError: unknown) => {
          console.error(rollbackError);
        });
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
    isDragging,
    search,
    setSearch,
    customCategories,
    setCustomCategories,
    mode,
    selectedPreview,
    allCategories,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCancel,
    onSubmit
  };
}
