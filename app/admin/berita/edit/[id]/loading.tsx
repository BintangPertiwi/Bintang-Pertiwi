import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoadingBeritaEdit() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/berita"
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Edit Berita</h1>
      </div>
      <FormSkeleton />
    </div>
  );
}
