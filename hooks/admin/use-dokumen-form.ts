import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DokumenRow } from "@/types";
import { deleteUploadedCloudinaryFile, uploadDocumentToCloudinary } from "@/lib/cloudinary-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dokumenSchema, type DokumenFormValues } from "@/types/forms";

const ALLOWED_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];
const MAX_DOC_MB = 15;

interface UseDokumenFormProps {
  existingCategories: string[];
  initialData?: DokumenRow;
  onSuccess?: () => void;
}

export function useDokumenForm({ existingCategories, initialData, onSuccess }: UseDokumenFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mode: "create" | "edit" = initialData ? "edit" : "create";
  const allCategories = useMemo(
    () => Array.from(new Set([...existingCategories, ...customCategories])),
    [existingCategories, customCategories]
  );

  const form = useForm<DokumenFormValues>({
    resolver: zodResolver(dokumenSchema),
    values: {
      judul: initialData?.judul || "",
      kategori: initialData?.kategori || "",
      deskripsi: initialData?.deskripsi || "",
    },
  });

  // Info file untuk ditampilkan (nama + tipe) — file baru dipilih atau file lama saat edit.
  const currentFileName = selectedFile?.name ?? (initialData?.url_file ? `Dokumen tersimpan (.${initialData.tipe_file || "file"})` : null);
  const currentTipe = selectedFile
    ? (selectedFile.name.split(".").pop() || "").toLowerCase()
    : (initialData?.tipe_file || "");
  const hasFile = !!selectedFile || (mode === "edit" && !!initialData?.url_file);

  const validateFile = (file: File): boolean => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      toast.error("Tipe file tidak didukung. Gunakan PDF, Word, Excel, PowerPoint, atau txt.");
      return false;
    }
    if (file.size > MAX_DOC_MB * 1024 * 1024) {
      toast.error(`Ukuran dokumen maksimal ${MAX_DOC_MB} MB.`);
      return false;
    }
    return true;
  };

  const applyFile = (file: File) => {
    setSelectedFile(file);
    form.setValue("file", file, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!validateFile(f)) return;
    applyFile(f);
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
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!validateFile(f)) return;
    applyFile(f);
  };

  const handleCancel = () => {
    form.reset();
    setSelectedFile(null);
    router.push("/admin/dokumen");
  };

  const onSubmit = async (values: DokumenFormValues) => {
    if (mode === "create" && !selectedFile) {
      toast.error("Harap unggah file dokumen terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    let uploaded: { url: string; resourceType: string } | null = null;

    try {
      let url_file = initialData?.url_file || "";
      let tipe_file = initialData?.tipe_file || "";
      let resource_type = initialData?.resource_type || "image";

      if (selectedFile) {
        const res = await uploadDocumentToCloudinary(selectedFile);
        url_file = res.url;
        tipe_file = res.tipe;
        resource_type = res.resourceType;
        uploaded = { url: res.url, resourceType: res.resourceType };
      }

      const endpoint = mode === "edit" && initialData ? `/api/dokumen/${initialData.id}` : "/api/dokumen";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: values.judul.trim(),
          kategori: values.kategori.trim(),
          deskripsi: values.deskripsi?.trim() || "",
          url_file,
          tipe_file,
          resource_type,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message || `Gagal ${mode === "edit" ? "memperbarui" : "menyimpan"} dokumen.`);
      }

      toast.success(`Dokumen berhasil ${mode === "edit" ? "diperbarui" : "ditambahkan"}!`);

      if (mode === "create") {
        form.reset();
        setSelectedFile(null);
      }

      onSuccess?.();
      router.push("/admin/dokumen");
      router.refresh();
    } catch (error) {
      console.error(error);
      if (uploaded) {
        await deleteUploadedCloudinaryFile(uploaded.url, uploaded.resourceType).catch((rollbackError: unknown) => {
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
    currentFileName,
    currentTipe,
    hasFile,
    allCategories,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCancel,
    onSubmit,
  };
}
