"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GaleriRow } from "@/types";
import { FileText, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";

import { usePengaturanBerandaForm } from "@/hooks/admin/use-pengaturan-beranda-form";

export function PengaturanBerandaForm({
  globalConfig,
  galeriList,
}: {
  globalConfig?: Record<string, string>;
  galeriList?: GaleriRow[];
}) {
  const {
    isSubmitting,
    draggingSlideId,
    slides,
    narasi,
    setNarasi,
    totalPenduduk,
    setTotalPenduduk,
    totalRw,
    setTotalRw,
    totalRt,
    setTotalRt,
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
  } = usePengaturanBerandaForm({ globalConfig });

  return (
    <> <form onSubmit={handleSubmit} className="max-w-4xl pb-20">
      <Accordion multiple defaultValue={["hero", "tentang", "galeri", "berita"]} className="w-full space-y-4">
        
        <AccordionItem value="hero" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Bagian Hero Banner
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-8">
            {slides.map((slide, index) => (
              <div key={slide.id} className="relative flex flex-col gap-6 p-6 border rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-slate-700">Pengaturan Slide</h4>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                    onClick={() => handleRemoveSlide(slide.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold">
                      Gambar Banner <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <div className="relative group mt-1">
                      <label 
                        htmlFor={`foto-${slide.id}`} 
                        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer overflow-hidden transition-all ${
                          draggingSlideId === slide.id 
                            ? "border-primary bg-primary/5" 
                            : "border-slate-300 bg-white hover:border-slate-400/80 hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => handleDragOver(e, slide.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, slide.id)}
                      >
                        {slide.foto ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 relative">
                            <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{slide.foto.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{(slide.foto.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : slide.currentFotoUrl ? (
                          <>
                            <Image 
                              src={slide.currentFotoUrl} 
                              alt="Current Cover" 
                              fill 
                              className="object-cover opacity-40 group-hover:opacity-20 transition-opacity" 
                              sizes="400px" 
                              priority
                            />
                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <ImagePlus className="w-8 h-8 text-foreground mb-2" />
                              <p className="text-sm text-foreground font-semibold">Ganti Gambar Banner</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                            <div className="flex gap-4 items-center mb-3 text-slate-500">
                              <ImagePlus className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-slate-500 mb-1">Geser & Lepas gambar banner ke sini</p>
                            <p className="text-xs text-muted-foreground">Rekomendasi ukuran: 1920x1080px (Landscape)</p>
                          </div>
                        )}
                        <Input
                          id={`foto-${slide.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => updateSlide(slide.id, "foto", e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`judul-${slide.id}`} className="text-sm font-semibold">
                      Judul Utama <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id={`judul-${slide.id}`}
                      placeholder="Teks besar yang tampil di tengah gambar..."
                      value={slide.judul}
                      onChange={(e) => updateSlide(slide.id, "judul", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`linkText-${slide.id}`} className="text-sm font-semibold">Teks Tombol Aksi</Label>
                    <Input
                      id={`linkText-${slide.id}`}
                      placeholder="Contoh: Pelajari Lebih Lanjut"
                      value={slide.linkText}
                      onChange={(e) => updateSlide(slide.id, "linkText", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`linkHref-${slide.id}`} className="text-sm font-semibold">Tujuan Tautan (URL)</Label>
                    <Input
                      id={`linkHref-${slide.id}`}
                      placeholder="Contoh: /profil atau https://..."
                      value={slide.linkHref}
                      onChange={(e) => updateSlide(slide.id, "linkHref", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-dashed h-14"
              onClick={handleAddSlide}
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Slide Banner
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tentang" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Bagian Tentang Kami & Statistik
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="narasi" className="text-sm font-semibold">
                Narasi / Misi Singkat <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Textarea
                id="narasi"
                placeholder="Tuliskan cerita singkat atau misi dusun..."
                className="resize-none min-h-[120px]"
                value={narasi}
                onChange={(e) => setNarasi(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Teks ini akan tampil besar di halaman beranda dengan efek pengetikan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="totalPenduduk" className="text-sm font-semibold">Total Penduduk</Label>
                <Input
                  id="totalPenduduk"
                  type="number"
                  min="0"
                  value={totalPenduduk}
                  onChange={(e) => setTotalPenduduk(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRw" className="text-sm font-semibold">Jumlah RW</Label>
                <Input
                  id="totalRw"
                  type="number"
                  min="0"
                  value={totalRw}
                  onChange={(e) => setTotalRw(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRt" className="text-sm font-semibold">Jumlah RT</Label>
                <Input
                  id="totalRt"
                  type="number"
                  min="0"
                  value={totalRt}
                  onChange={(e) => setTotalRt(e.target.value)}
                  required
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="galeri" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Bagian Galeri Beranda
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Pilih hingga 5 foto galeri yang akan ditampilkan pada _slider_ di halaman utama. Jika tidak ada yang dipilih, sistem akan menampilkan 5 foto terbaru secara otomatis.
              </p>
              <span className="text-sm font-semibold whitespace-nowrap ml-4">
                Terpilih: {selectedGaleriIds.length} / 5
              </span>
            </div>
            
            {galeriList && galeriList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                {galeriList.map((galeri) => {
                  const isSelected = selectedGaleriIds.includes(galeri.id);
                  return (
                    <label 
                      key={galeri.id}
                      className={`relative flex flex-col border-2 cursor-pointer overflow-hidden transition-all ${
                        isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <div className="relative aspect-video bg-slate-100 border-b flex shrink-0 items-center justify-center">
                        {galeri.url_foto ? (
                          <Image src={galeri.url_foto} alt={galeri.judul || "Galeri"} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" priority={true} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground"><ImagePlus className="w-8 h-8 opacity-40" /></div>
                        )}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="font-semibold text-[9px] uppercase tracking-wider bg-white/95 backdrop-blur-sm text-slate-700 rounded-full px-2 py-0.5 shadow-sm border">
                            {galeri.kategori}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 bg-white rounded-md shadow-sm z-10">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => handleToggleGaleri(galeri.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white flex flex-col flex-1 justify-start">
                        <p className="text-[13px] font-semibold line-clamp-2 leading-snug text-slate-800">{galeri.judul || "Tanpa Judul"}</p>
                        {galeri.deskripsi && (
                          <p className="text-[10px] text-slate-500 line-clamp-1">{galeri.deskripsi}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 border rounded-lg bg-slate-50 text-slate-500">
                Belum ada data galeri. Silakan tambahkan galeri terlebih dahulu.
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="berita" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Bagian Berita Beranda
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Berita di halaman utama beranda akan selalu menampilkan urutan berita yang <strong>paling baru (terbaru)</strong> secara otomatis. Anda tidak perlu mengatur berita secara manual dari halaman ini.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      <div className="pt-8">
        <Button type="submit" disabled={isSubmitting} className="w-full px-8 text-base h-14">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyimpan Perubahan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </div>
      </form>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan Pengaturan Beranda?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan ini? Data akan diperbarui dan ditampilkan di halaman beranda publik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Ya, Simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
