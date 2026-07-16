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
import { useProdukForm } from "@/hooks/admin/use-produk-form";
import { cn } from "@/lib/utils";
import type { ProdukRow } from "@/types";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { ProdukImageUploader } from "./produk-image-uploader";

interface ProdukFormProps {
  existingCategories: string[];
  initialData?: ProdukRow;
  onSuccess?: () => void;
}

export function ProdukForm({ existingCategories, initialData, onSuccess }: ProdukFormProps) {
  const {
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
    maxImages,
    handleFileChange,
    removeImage,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCancel,
    onSubmit,
  } = useProdukForm({ existingCategories, initialData, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <ProdukImageUploader
              images={images}
              isDragging={isDragging}
              maxImages={maxImages}
              onFileChange={handleFileChange}
              onRemove={removeImage}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Nama Produk <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Keripik Bayam Krispi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
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
                              !field.value && "text-muted-foreground"
                            )}
                          />
                        }
                      >
                        {field.value ? field.value : "Pilih atau ketik kategori..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-(--anchor-width) p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Cari kategori..."
                            value={search}
                            onValueChange={(val) => setSearch(val)}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start text-sm"
                                onPointerDown={(event) => {
                                  event.preventDefault();
                                  const newCat = search.trim();
                                  if (
                                    newCat &&
                                    !customCategories.includes(newCat) &&
                                    !existingCategories.includes(newCat)
                                  ) {
                                    setCustomCategories([...customCategories, newCat]);
                                  }
                                  if (newCat) field.onChange(newCat);
                                  setComboboxOpen(false);
                                  setSearch("");
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Buat &quot;{search.trim()}&quot;
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {allCategories.map((cat) => (
                                <CommandItem
                                  key={cat}
                                  value={cat}
                                  onSelect={() => {
                                    field.onChange(field.value === cat ? "" : cat);
                                    setComboboxOpen(false);
                                    setSearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.toLowerCase() === cat.toLowerCase()
                                        ? "opacity-100"
                                        : "opacity-0"
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

          <FormField
            control={form.control}
            name="harga"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Harga (Rp) <span className="text-red-500 ml-0.5">*</span>
                </FormLabel>
                <FormControl>
                  <Input inputMode="numeric" placeholder="Contoh: 15000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="harga_coret"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Harga Coret (Opsional)</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" placeholder="Harga sebelum diskon" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stok"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Ketersediaan</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status stok" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tersedia">Tersedia</SelectItem>
                      <SelectItem value="Habis">Habis</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">SKU (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: OLH-BYM-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Tags (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Pisahkan dengan koma. Contoh: Camilan, Gurih" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="deskripsi_singkat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Deskripsi Singkat <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ringkasan singkat produk (tampil di kartu katalog)..."
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="deskripsi_lengkap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Deskripsi Lengkap (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Penjelasan lengkap produk..."
                      className="resize-none min-h-[140px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="informasi_tambahan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Informasi Tambahan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={"Satu baris = Label: Nilai\nContoh:\nBerat Bersih: 150 gram\nDaya Tahan: 3 bulan"}
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Tulis satu info per baris dengan format <span className="font-medium">Label: Nilai</span>.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            className="w-full sm:w-auto text-base h-14 order-2 sm:order-1"
            onClick={handleCancel}
          >
            Batal
          </Button>

          <Button
            type="submit"
            className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
            disabled={isLoading || images.length === 0}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isLoading
              ? mode === "edit"
                ? "Menyimpan..."
                : "Mengunggah..."
              : mode === "edit"
                ? "Simpan Perubahan"
                : "Simpan Produk"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
