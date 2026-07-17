"use client";

import { Button } from "@/components/ui/button";
import type { GaleriRow } from "@/types";
import {
  Check,
  ChevronsUpDown,
  Image as ImageIcon,
  Loader2,
  Plus
} from "lucide-react";
import Image from "next/image";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useGaleriForm } from "@/hooks/admin/use-galeri-form";

interface GaleriFormFieldsProps {
  existingCategories: string[];
  initialData?: GaleriRow;
  onSuccess?: () => void;
}

export function GaleriFormFields({
  existingCategories,
  initialData,
  onSuccess,
}: GaleriFormFieldsProps) {
  const {
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
    onSubmit,
  } = useGaleriForm({ existingCategories, initialData, onSuccess });

  const file = form.watch("foto");
  const kategori = form.watch("kategori");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl space-y-10 pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Foto Galeri */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold">
              Foto Galeri <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <div className="relative group mt-1">
              <label
                htmlFor="dropzone-file"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-md cursor-pointer overflow-hidden transition-all relative",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent hover:border-slate-400/80 hover:bg-muted",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedPreview ? (
                  <>
                    <Image
                      src={selectedPreview}
                      alt="Preview galeri"
                      fill
                      className="object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                      unoptimized={selectedPreview.startsWith("blob:")}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-foreground mb-2" />
                      <p className="text-sm text-foreground font-semibold">
                        Ganti Gambar
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center z-10 relative">
                    <div className="flex gap-4 items-center mb-3 text-muted-foreground">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      Geser & Lepas berkas disini
                    </p>
                  </div>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Judul Foto */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Judul Foto <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: KEINDAHAN ALAM" {...field} />
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
                              "w-full justify-between h-14 font-normal",
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

          {/* Deskripsi */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Deskripsi (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis deskripsi singkat..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 md:col-span-2">
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            className="w-full sm:w-auto text-base h-14 order-2 sm:order-1"
            onClick={handleCancel}
          >Batal
          </Button>

          <Button
            type="submit"
            className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
            disabled={isLoading || !kategori || (mode === "create" && !file)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            {isLoading
              ? mode === "edit"
                ? "Menyimpan..."
                : "Mengunggah..."
              : mode === "edit"
                ? "Simpan Perubahan"
                : "Simpan Foto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
