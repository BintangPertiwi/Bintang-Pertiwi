import { uploadToCloudinary } from "@/lib/cloudinary-client";
import type { ParsedSlide, SlideData } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function usePengaturanBerandaForm({
  globalConfig,
}: {
  globalConfig?: Record<string, string>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [draggingSlideId, setDraggingSlideId] = useState<string | null>(null);

  let initialSlides: SlideData[] = [
    {
      id: "slide-1",
      judul: "Membangun Bintang Pertiwi yang Lebih Mandiri dan Sejahtera",
      linkText: "Pelajari Lebih Lanjut",
      linkHref: "/produk-umkm",
      foto: null,
      currentFotoUrl: "",
    },
  ];

  if (globalConfig?.["beranda_hero_slides"]) {
    try {
      const parsed = JSON.parse(globalConfig["beranda_hero_slides"]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialSlides = parsed.map((s: ParsedSlide, i: number) => ({
          id: s.id || `slide-initial-${i}`,
          judul: s.title || "",
          linkText: s.linkText || "",
          linkHref: s.linkHref || "",
          foto: null,
          currentFotoUrl: s.image || "",
        }));
      }
    } catch {
      // ignore parse error
    }
  }

  const [slides, setSlides] = useState<SlideData[]>(initialSlides);

  const [narasi, setNarasi] = useState(
    globalConfig?.["beranda_tentang_narasi"] || 
    "Misi kami adalah mewujudkan Bintang Pertiwi yang sejahtera, mandiri, dan berbudaya melalui kolaborasi aktif warga, pemanfaatan potensi alam yang berkelanjutan, serta pelayanan publik yang transparan."
  );
  
  const [nilaiEkonomi, setNilaiEkonomi] = useState(globalConfig?.["beranda_tentang_penduduk"] || "0");
  const [mitraBinaan, setMitraBinaan] = useState(globalConfig?.["beranda_tentang_rw"] || "0");
  const [penerimaLangsung, setPenerimaLangsung] = useState(globalConfig?.["beranda_tentang_rt"] || "0");
  const [penerimaTidakLangsung, setPenerimaTidakLangsung] = useState(globalConfig?.["beranda_tentang_penerima_tidak_langsung"] || "0");

  const [selectedGaleriIds, setSelectedGaleriIds] = useState<string[]>(
    globalConfig?.["beranda_galeri_ids"] ? globalConfig["beranda_galeri_ids"].split(",").map(id => id.trim()) : []
  );

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        id: `slide-${Date.now()}`,
        judul: "",
        linkText: "",
        linkHref: "",
        foto: null,
        currentFotoUrl: "",
      },
    ]);
  };

  const handleRemoveSlide = (id: string) => {
    if (slides.length === 1) {
      toast.error("Minimal harus ada 1 slide banner.");
      return;
    }
    setSlides(slides.filter((slide) => slide.id !== id));
  };

  const updateSlide = <K extends keyof SlideData>(id: string, field: K, value: SlideData[K]) => {
    setSlides(
      slides.map((slide) => (slide.id === id ? { ...slide, [field]: value } : slide))
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>, slideId: string) => {
    e.preventDefault();
    setDraggingSlideId(slideId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDraggingSlideId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, slideId: string) => {
    e.preventDefault();
    setDraggingSlideId(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type.startsWith("image/")) {
        updateSlide(slideId, "foto", f);
      } else {
        toast.error("Harap unggah file gambar.");
      }
    }
  };

  const handleToggleGaleri = (id: string) => {
    setSelectedGaleriIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 5) {
          toast.error("Maksimal 5 galeri yang dapat dipilih.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    
    try {
      const finalSlides = [];
      
      for (const slide of slides) {
        let imageUrl = slide.currentFotoUrl;
        
        if (slide.foto) {
          try {
            imageUrl = await uploadToCloudinary(slide.foto);
          } catch {
            toast.error(`Gagal mengunggah foto untuk slide: ${slide.judul}`);
            setIsSubmitting(false);
            return;
          }
        }
        
        finalSlides.push({
          id: slide.id,
          image: imageUrl,
          title: slide.judul,
          linkText: slide.linkText,
          linkHref: slide.linkHref,
        });
      }

      const response = await fetch("/api/pengaturan-beranda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beranda_hero_slides: JSON.stringify(finalSlides),
          beranda_tentang_narasi: narasi,
          beranda_tentang_penduduk: nilaiEkonomi,
          beranda_tentang_rw: mitraBinaan,
          beranda_tentang_rt: penerimaLangsung,
          beranda_tentang_penerima_tidak_langsung: penerimaTidakLangsung,
          beranda_galeri_ids: selectedGaleriIds.join(","),
        }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan pengaturan.");
      toast.success("Pengaturan galeri beranda berhasil disimpan!");
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
    draggingSlideId,
    slides,
    narasi,
    setNarasi,
    nilaiEkonomi,
    setNilaiEkonomi,
    mitraBinaan,
    setMitraBinaan,
    penerimaLangsung,
    setPenerimaLangsung,
    penerimaTidakLangsung,
    setPenerimaTidakLangsung,
    selectedGaleriIds,
    handleAddSlide,
    handleRemoveSlide,
    updateSlide,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleToggleGaleri,
    handleSubmit,
    isConfirmOpen,
    setIsConfirmOpen,
    handleConfirmSubmit,
  };
}
