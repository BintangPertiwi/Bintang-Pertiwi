"use client";

import { Button } from "@/components/ui/button";
import type { DokumenRow } from "@/types";
import { Check, ChevronsUpDown, Loader2, Plus, UploadCloud } from "lucide-react";

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
import { FileTypeIcon } from "@/components/dokumen/file-type-icon";

import { useDokumenForm } from "@/hooks/admin/use-dokumen-form";

interface DokumenFormFieldsProps {
  existingCategories: string[];
  initialData?: DokumenRow;
  onSuccess?: () => void;
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

export function DokumenFormFields({
  existingCategories,
  initialData,
  onSuccess,
}: DokumenFormFieldsProps) {
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
  } = useDokumenForm({ existingCategories, initialData, onSuccess });

  const kategori = form.watch("kategori");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl space-y-10 pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* File Dokumen */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold">
              File Dokumen <span className="text-red-500 ml-0.5">*</span>
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
                {hasFile ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <FileTypeIcon tipe={currentTipe} className="w-10 h-10 mb-2" />
                    <p className="text-sm font-semibold text-foreground truncate max-w-[260px]">
                      {currentFileName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Klik untuk mengganti file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                    <UploadCloud className="w-6 h-6 mb-2" />
                    <p className="text-[13px]">Geser & Lepas file di sini</p>
                    <p className="text-[11px] mt-1">PDF, Word, Excel, PowerPoint, txt · maks 15 MB</p>
                  </div>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept={ACCEPT}
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Judul */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Judul Dokumen <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Profil Bintang Pertiwi 2026" {...field} />
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
                        {field.value ? field.value : "Pilih atau ketik kategori..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-(--anchor-width) p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Cari kategori..."
                            value={search}
                            onValueChange={(val) => setSearch(val.toUpperCase())}
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
                                Buat &quot;{search.trim().toUpperCase()}&quot;
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
                  <FormLabel className="text-sm font-semibold">Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis deskripsi singkat dokumen..."
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
          >
            Batal
          </Button>

          <Button
            type="submit"
            className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
            disabled={isLoading || !kategori || (mode === "create" && !hasFile)}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isLoading
              ? mode === "edit"
                ? "Menyimpan..."
                : "Mengunggah..."
              : mode === "edit"
                ? "Simpan Perubahan"
                : "Simpan Dokumen"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
