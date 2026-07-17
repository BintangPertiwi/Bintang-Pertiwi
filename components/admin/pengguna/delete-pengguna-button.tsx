"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeletePenggunaButtonProps {
  id: number;
  username: string;
  isSelf: boolean;
  triggerClassName?: string;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showText?: boolean;
}

export function DeletePenggunaButton({ id, username, isSelf, triggerClassName, triggerVariant = "destructive", showText = true }: DeletePenggunaButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/pengguna/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOpen(false);
        toast.success("Akun berhasil dihapus.");
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Gagal menghapus akun");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={
        <Button 
          variant={triggerVariant} 
          size="sm" 
          className={triggerClassName || "h-8 px-2"} 
          disabled={isDeleting || isSelf}
          title={isSelf ? "Anda tidak dapat menghapus akun Anda sendiri" : "Hapus Akun"}
        />
      }>
        <Trash2 className={`h-4 w-4 ${showText ? "mr-2" : ""}`} />
        {showText && "Hapus"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Akun Ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Akun <strong>&quot;{username}&quot;</strong> akan dihapus secara permanen dari sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
