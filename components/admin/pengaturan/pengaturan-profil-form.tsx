"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";

import { usePengaturanProfilForm } from "@/hooks/admin/use-pengaturan-profil-form";

export function PengaturanProfilForm({
  globalConfig,
}: {
  globalConfig: Record<string, string>;
}) {
  const {
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
  } = usePengaturanProfilForm({ globalConfig });

  return (
    <> <form onSubmit={handleSubmit} className="max-w-4xl pb-20">
      <Accordion multiple defaultValue={["header", "visi-misi", "sections"]} className="w-full space-y-4">
        
        {/* SECTION: HEADER */}
        <AccordionItem value="header" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Header Profil
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headerTitle" className="text-sm font-semibold">
                Judul Header
              </Label>
              <Input
                id="headerTitle"
                placeholder="Contoh: Profil"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headerDesc" className="text-sm font-semibold">
                Deskripsi Singkat Header
              </Label>
              <Textarea
                id="headerDesc"
                placeholder="Contoh: Mengenal lebih dekat sejarah..."
                className="resize-none min-h-[80px]"
                value={headerDesc}
                onChange={(e) => setHeaderDesc(e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION: VISI & MISI */}
        <AccordionItem value="visi-misi" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Visi & Misi
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-8">
            <div className="space-y-2">
              <Label htmlFor="visi" className="text-sm font-semibold">
                Visi
              </Label>
              <Textarea
                id="visi"
                placeholder="Menjadikan dusun..."
                className="resize-none min-h-[100px]"
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold">Misi</Label>
              {misiList.map((misi, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="pt-2 text-primary font-bold">{index + 1}.</div>
                  <Textarea
                    placeholder="Meningkatkan kualitas..."
                    className="resize-none min-h-[40px]"
                    value={misi}
                    onChange={(e) => handleChangeMisi(index, e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
                    onClick={() => handleRemoveMisi(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddMisi}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Misi
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION: SECTIONS */}
        <AccordionItem value="sections" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Bagian (Section) Profil
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-8">
            <div className="text-sm text-slate-500 mb-4">
              Tambahkan bagian untuk halaman profil seperti Sejarah, Kondisi Geografis, atau Potensi.
            </div>

            {sections.map((section, index) => (
              <div key={section.id} className="relative flex flex-col gap-6 p-6 border rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-slate-700">Pengaturan Bagian</h4>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                    onClick={() => handleRemoveSection(section.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Gambar */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold">
                      Gambar Visual <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <div className="relative group mt-1">
                      <label 
                        htmlFor={`foto-${section.id}`} 
                        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer overflow-hidden transition-all ${
                          draggingSectionId === section.id 
                            ? "border-primary bg-primary/5" 
                            : "border-slate-300 bg-white hover:border-slate-400/80 hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => handleDragOver(e, section.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, section.id)}
                      >
                        {section.foto ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 relative">
                            <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{section.foto.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{(section.foto.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : section.currentFotoUrl ? (
                          <>
                            <Image 
                              src={section.currentFotoUrl} 
                              alt="Current Image" 
                              fill 
                              className="object-cover opacity-40 group-hover:opacity-20 transition-opacity" 
                              sizes="400px" 
                              priority
                            />
                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <ImagePlus className="w-8 h-8 text-foreground mb-2" />
                              <p className="text-sm text-foreground font-semibold">Ganti Gambar</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                            <div className="flex gap-4 items-center mb-3 text-slate-500">
                              <ImagePlus className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-slate-500 mb-1">Geser & Lepas gambar ke sini</p>
                            <p className="text-xs text-muted-foreground">Disarankan aspek rasio 4:3</p>
                          </div>
                        )}
                        <Input
                          id={`foto-${section.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => updateSection(section.id, "foto", e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Judul & Deskripsi */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`title-${section.id}`} className="text-sm font-semibold">
                      Judul Bagian <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id={`title-${section.id}`}
                      placeholder="Contoh: Sejarah"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, "title", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`desc-${section.id}`} className="text-sm font-semibold">Deskripsi Paragraf</Label>
                    <Textarea
                      id={`desc-${section.id}`}
                      placeholder="Tuliskan paragraf..."
                      className="resize-none min-h-[120px]"
                      value={section.description}
                      onChange={(e) => updateSection(section.id, "description", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-dashed h-14"
              onClick={handleAddSection}
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Bagian Profil
            </Button>
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
            <AlertDialogTitle>Simpan Pengaturan Profil?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan ini? Data akan diperbarui dan ditampilkan di halaman publik.
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
