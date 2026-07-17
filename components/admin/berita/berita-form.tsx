"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BeritaFormValues } from "@/types/forms";
import {
  Check,
  ChevronsUpDown,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Send
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";

import type { BeritaRow } from "@/types";

const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/rich-text-editor").then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);

import { useBeritaForm } from "@/hooks/admin/use-berita-form";

interface BeritaFormProps {
  initialData?: BeritaRow;
  existingCategories: string[];
}

export function BeritaForm({
  initialData,
  existingCategories,
}: BeritaFormProps) {
  const {
    form: rawForm,
    isSubmitting,
    comboboxOpen,
    setComboboxOpen,
    search,
    setSearch,
    customCategories,
    setCustomCategories,
    allCategories,
    isDragging,
    isEdit,
    mediaAssets,
    setMediaAssets,
    handleMediaUploadSuccess,
    handleCancel,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onSubmit,
  } = useBeritaForm({ initialData, existingCategories });

  const form = rawForm as unknown as UseFormReturn<BeritaFormValues>;

  const foto = form.watch("foto");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl space-y-10 pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Judul Berita */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Judul Berita <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Kerja Bakti Massal Sambut HUT RI"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Kategori */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="kategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Kategori <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxOpen}
                            className={cn(
                              "w-full justify-between h-11 font-normal bg-background",
                              !field.value && "text-muted-foreground",
                            )}
                          />
                        }
                      >
                        {field.value
                          ? field.value
                          : "Pilih atau ketik kategori..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--anchor-width) p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Cari kategori..."
                            value={search}
                            onValueChange={(val) =>
                              setSearch(val.toUpperCase())
                            }
                          />
                          <CommandList>
                            <CommandEmpty>
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start text-sm"
                                onPointerDown={(event) => {
                                  event.preventDefault();
                                  const newCat = search.trim().toUpperCase();
                                  if (
                                    !customCategories.includes(newCat) &&
                                    !existingCategories.includes(newCat)
                                  ) {
                                    setCustomCategories([
                                      ...customCategories,
                                      newCat,
                                    ]);
                                  }
                                  field.onChange(newCat);
                                  setComboboxOpen(false);
                                  setSearch("");
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Buat &quot;{search.trim().toUpperCase()}&quot;
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {allCategories.map((cat) => (
                                <CommandItem
                                  key={cat}
                                  value={cat}
                                  onSelect={() => {
                                    field.onChange(
                                      field.value === cat ? "" : cat,
                                    );
                                    setComboboxOpen(false);
                                    setSearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.toLowerCase() ===
                                        cat.toLowerCase()
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {cat}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ringkasan Singkat */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="ringkasan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Ringkasan Singkat
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis 1-2 kalimat untuk pratinjau di beranda..."
                      className="resize-none min-h-[100px]"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Maksimal 150 karakter direkomendasikan.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Foto Kover */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold">Gambar Sampul</Label>
            <div className="relative group mt-1">
              <label
                htmlFor="foto"
                className={`flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-md cursor-pointer overflow-hidden transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent hover:border-slate-400/80 hover:bg-muted"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {foto ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 relative">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                      {foto.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(foto.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : initialData?.url_foto ? (
                  <>
                    <Image
                      src={initialData.url_foto}
                      alt="Current Cover"
                      fill
                      className="object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                      sizes="300px"
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <ImagePlus className="w-6 h-6 text-foreground mb-2" />
                      <p className="text-sm text-foreground font-semibold">
                        Ganti Gambar
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                    <div className="flex gap-4 items-center mb-3 text-muted-foreground">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      Geser & Lepas berkas disini
                    </p>
                  </div>
                )}
                <Input
                  id="foto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    form.setValue("foto", e.target.files?.[0] || null, {
                      shouldValidate: true,
                    })
                  }
                />
              </label>
            </div>
          </div>

          {/* Naskah Berita */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="isi_berita"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Naskah Berita <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="border border-input rounded-md overflow-hidden hover:border-slate-400/80 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        mediaAssets={mediaAssets}
                        setMediaAssets={setMediaAssets}
                        onMediaUploadSuccess={handleMediaUploadSuccess}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {isEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2 md:col-span-2">
              <FormField
                control={form.control}
                name="status_publikasi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Status Publikasi
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Publik">Publik</SelectItem>
                        <SelectItem value="Draf">Draf</SelectItem>
                        <SelectItem value="Arsip">Arsip</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 md:col-span-2">
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            className="w-full sm:w-auto text-base h-14 order-2 sm:order-1"
            onClick={handleCancel}
          >
            Batal
          </Button>

          {isEdit ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="mr-2 h-5 w-5" /> Simpan Perubahan</>
              )}
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
                onClick={() => form.setValue("status_publikasi", "Draf")}
              >
                <FileText className="mr-2 h-5 w-5" /> Simpan sebagai Draf
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 text-base h-14 order-1 sm:order-3"
                onClick={() => form.setValue("status_publikasi", "Publik")}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menerbitkan...</>
                ) : (
                  <><Send className="mr-2 h-5 w-5" /> Terbitkan Berita</>
                )}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
