import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary-client";
import type { ProfileSection } from "@/types";

export function usePengaturanProfilForm({
  globalConfig,
}: {
  globalConfig: Record<string, string>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);

  const [visi, setVisi] = useState(globalConfig["profil_visi"] || "");
  const [headerTitle, setHeaderTitle] = useState(globalConfig["profil_header_title"] || "Profil Dusun");
  const [headerDesc, setHeaderDesc] = useState(globalConfig["profil_header_desc"] || "Mengenal lebih dekat sejarah, kondisi alam, dan potensi yang dimiliki oleh Bintang Pertiwi.");
  
  const [misiList, setMisiList] = useState<string[]>(() => {
    try {
      if (globalConfig["profil_misi"]) {
        const parsed = JSON.parse(globalConfig["profil_misi"]);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [""];
  });

  const [sections, setSections] = useState<ProfileSection[]>(() => {
    try {
      if (globalConfig["profil_sections"]) {
        const parsed = JSON.parse(globalConfig["profil_sections"]);
        if (Array.isArray(parsed)) {
          return parsed.map((s: { id?: string; title?: string; description?: string; image?: string }, index: number) => ({
            id: s.id || `section-initial-${index}`,
            title: s.title || "",
            description: s.description || "",
            foto: null,
            currentFotoUrl: s.image || "",
          }));
        }
      }
    } catch {}
    return [];
  });

  // Misi Handlers
  const handleAddMisi = () => setMisiList([...misiList, ""]);
  const handleRemoveMisi = (index: number) => {
    const newMisi = [...misiList];
    newMisi.splice(index, 1);
    setMisiList(newMisi.length > 0 ? newMisi : [""]);
  };
  const handleChangeMisi = (index: number, value: string) => {
    const newMisi = [...misiList];
    newMisi[index] = value;
    setMisiList(newMisi);
  };

  // Section Handlers
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: "",
        description: "",
        foto: null,
        currentFotoUrl: "",
      },
    ]);
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const updateSection = <K extends keyof ProfileSection>(id: string, field: K, value: ProfileSection[K]) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>, id: string) => {
    e.preventDefault();
    setDraggingSectionId(id);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDraggingSectionId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, id: string) => {
    e.preventDefault();
    setDraggingSectionId(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type.startsWith("image/")) {
        updateSection(id, "foto", f);
      } else {
        toast.error("Harap unggah file gambar.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    
    try {
      const finalSections = await Promise.all(
        sections.map(async (sec) => {
          let imageUrl = sec.currentFotoUrl;
          if (sec.foto) {
            imageUrl = await uploadToCloudinary(sec.foto);
          }
          return {
            id: sec.id,
            title: sec.title,
            description: sec.description,
            image: imageUrl,
          };
        })
      );

      const payload = {
        profil_header_title: headerTitle,
        profil_header_desc: headerDesc,
        profil_visi: visi,
        profil_misi: JSON.stringify(misiList.filter(m => m.trim() !== "")),
        profil_sections: JSON.stringify(finalSections),
      };

      const response = await fetch("/api/pengaturan-profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal menyimpan pengaturan.");
      toast.success("Pengaturan profil berhasil disimpan!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    draggingSectionId,
    visi,
    setVisi,
    headerTitle,
    setHeaderTitle,
    headerDesc,
    setHeaderDesc,
    misiList,
    sections,
    handleAddMisi,
    handleRemoveMisi,
    handleChangeMisi,
    handleAddSection,
    handleRemoveSection,
    updateSection,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    isConfirmOpen,
    setIsConfirmOpen,
    handleConfirmSubmit,
  };
}
