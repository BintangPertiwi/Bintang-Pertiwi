"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";
import ImageExtension from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Bold, CheckCircle2, FileImage, Heading2, Heading3, ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Loader2, Strikethrough, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  mediaAssets?: string[];
  setMediaAssets?: React.Dispatch<React.SetStateAction<string[]>>;
  onMediaUploadSuccess?: (url: string) => void;
}

const BUBBLE_MENU_OPTIONS = { placement: "top" } as const;
const FLOATING_MENU_OPTIONS = { placement: "bottom-start", offset: 8 } as const;

export function RichTextEditor({ value, onChange, mediaAssets = [], setMediaAssets, onMediaUploadSuccess }: RichTextEditorProps) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const [isMediaModalOpen, setIsMediaModalOpen] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [assetToDelete, setAssetToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full h-auto mx-auto object-contain",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onTransaction: () => forceUpdate(),
    editorProps: {
      attributes: {
        class: "min-h-[300px] w-full bg-transparent px-4 py-4 text-sm outline-none prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const currentHTML = editor.getHTML();
  const unusedAssets = mediaAssets.filter(url => !currentHTML.includes(url));

  const handleAddUrl = () => {
    if (!urlInput) return;
    editor.chain().focus().setImage({ src: urlInput }).run();
    setUrlInput("");
    setIsMediaModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaAssets.length >= 5) {
      toast.error("Batas maksimal 5 gambar per berita telah tercapai.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (setMediaAssets) {
        setMediaAssets((prev) => [...prev, url]);
      }
      if (onMediaUploadSuccess) {
        onMediaUploadSuccess(url);
      }
      toast.success("Gambar berhasil diunggah.");
      editor.chain().focus().setImage({ src: url }).run();
      setIsMediaModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah gambar.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const confirmDeleteAsset = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    
    try {
      await deleteUploadedCloudinaryImage(assetToDelete);
      if (setMediaAssets) {
        setMediaAssets((prev) => prev.filter((u) => u !== assetToDelete));
      }
      
      if (currentHTML.includes(assetToDelete)) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = currentHTML;
        
        const images = tempDiv.querySelectorAll(`img[src="${assetToDelete}"]`);
        images.forEach(img => img.remove());
        
        editor.commands.setContent(tempDiv.innerHTML);
      }
      
      toast.success("Gambar berhasil dihapus.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error("Gagal menghapus gambar: " + msg);
    } finally {
      setIsDeleting(false);
      setAssetToDelete(null);
    }
  };

  return (
    <div className="flex flex-col rounded-md border bg-card shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />

        {/* Media Manager Dialog */}
        <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
          <DialogTrigger render={
            <Toggle
              size="sm"
              pressed={false}
              className="border hover:bg-muted transition-all"
              aria-label="Insert Image"
            />
          }>
            <ImageIcon className="h-4 w-4" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] h-[550px] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Media Berita</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Kelola dan sisipkan gambar untuk berita ini.</p>
            </DialogHeader>
            <Tabs defaultValue="upload" className="flex-1 flex flex-col px-6 pb-6">
              <TabsList className="grid w-full grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-3 h-auto! gap-1">
                <TabsTrigger value="upload" className="w-full cursor-pointer h-auto! py-1.5">Upload</TabsTrigger>
                <TabsTrigger value="media" className="w-full cursor-pointer h-auto! py-1.5 whitespace-normal text-center">
                  Media Tersimpan {mediaAssets.length > 0 && `(${mediaAssets.length})`}
                </TabsTrigger>
                <TabsTrigger value="url" className="w-full cursor-pointer h-auto! py-1.5">URL Eksternal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="flex-1 mt-4">
                <div className="flex flex-col items-center justify-center min-h-[250px] h-full border-2 border-dashed border-border rounded-md bg-muted">
                  {isUploading ? (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-4" />
                      <p>Mengunggah gambar...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground font-medium text-center px-4">Geser & lepas file atau klik tombol di bawah</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-6 text-center px-4">Maksimal 5 gambar per berita ({5 - mediaAssets.length} tersisa).</p>
                      <label className={`cursor-pointer bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors ${mediaAssets.length >= 5 ? "opacity-50 pointer-events-none" : ""}`}>
                        Pilih Gambar Baru
                        <Input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileUpload} 
                          disabled={mediaAssets.length >= 5}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="media" className="flex-1 mt-4 overflow-y-auto max-h-[350px]">
                {mediaAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <FileImage className="w-12 h-12 text-muted-foreground mb-4" />
                    <p>Belum ada media yang diunggah.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaAssets.map((url, idx) => {
                      const isUsed = currentHTML.includes(url);
                      return (
                        <div key={idx} className="relative group border rounded-md overflow-hidden bg-muted aspect-square">
                          <Image src={url} alt={`Media ${idx}`} fill sizes="120px" className="object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => {
                              editor.chain().focus().setImage({ src: url }).run();
                              setIsMediaModalOpen(false);
                            }}>Gunakan</Button>
                            <Button size="sm" variant="destructive" onClick={() => setAssetToDelete(url)}>
                              <Trash2 className="w-4 h-4 mr-1" /> Hapus
                            </Button>
                          </div>
                          {!isUsed && (
                            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">
                              Tdk Dipakai
                            </span>
                          )}
                          {isUsed && (
                            <span className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="url" className="flex-1 mt-4">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tautan Gambar Lengkap</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddUrl} disabled={!urlInput}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Sisipkan Tautan
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      
      {unusedAssets.length > 0 && (
        <div className="bg-yellow-50/50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between text-xs text-yellow-800">
          <span>Terdapat {unusedAssets.length} gambar yang telah diunggah tapi tidak terpakai di naskah.</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2 hover:bg-yellow-200/50" onClick={() => setIsMediaModalOpen(true)}>
            Kelola
          </Button>
        </div>
      )}

      {/* Alert Dialog Konfirmasi Hapus */}
      <AlertDialog open={!!assetToDelete} onOpenChange={(open) => !open && !isDeleting && setAssetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus media secara permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Gambar akan dihapus dari server Cloudinary
              {assetToDelete && currentHTML.includes(assetToDelete) && (
                <span className="block mt-2 font-medium text-red-600">
                  Perhatian: Gambar ini sedang digunakan dalam naskah berita. Menghapusnya juga akan menghapus gambar tersebut dari naskah Anda.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteAsset} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menghapus...
                </>
              ) : (
                "Ya, Hapus Permanen"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editor && (
        <BubbleMenu editor={editor} options={BUBBLE_MENU_OPTIONS}>
          <div className="flex items-center gap-1 bg-card border shadow-md rounded-md p-1 border-border">
            <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-8 px-2 data-[state=on]:bg-muted">
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className="h-8 px-2 data-[state=on]:bg-muted">
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className="h-8 px-2 data-[state=on]:bg-muted">
              <Strikethrough className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-4 bg-accent mx-1" />
            <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 px-2 data-[state=on]:bg-muted">
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 px-2 data-[state=on]:bg-muted">
              <Heading3 className="h-4 w-4" />
            </Toggle>
          </div>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu editor={editor} options={FLOATING_MENU_OPTIONS}>
          <div className="flex flex-wrap items-center gap-1 bg-card border shadow-md rounded-md p-1 border-border">
            <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-8 px-2" title="Bold">
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className="h-8 px-2" title="Italic">
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className="h-8 px-2" title="Strikethrough">
              <Strikethrough className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-4 bg-accent mx-1" />
            <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 px-2" title="Heading 2">
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 px-2" title="Heading 3">
              <Heading3 className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className="h-8 px-2" title="Bullet List">
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 px-2" title="Ordered List">
              <ListOrdered className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-4 bg-accent mx-1" />
            <Button size="sm" variant="ghost" className="h-8 px-2 hover:bg-muted" onClick={(e) => { e.preventDefault(); setIsMediaModalOpen(true); }} title="Sisipkan Gambar">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
