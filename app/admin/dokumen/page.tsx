import { getDokumenListing } from "@/lib/db/queries";
import { cookies } from "next/headers";

import { EmptyState } from "@/components/admin/common/empty-state";
import { ListingPagination } from "@/components/admin/common/listing-pagination";
import { ListingToolbar } from "@/components/admin/common/listing-toolbar";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { DokumenGrid } from "./dokumen-grid";
import { DokumenTable } from "./dokumen-table";

export const metadata = {
  title: "Dokumen — Bintang Pertiwi",
};

interface DokumenPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminDokumenPage({ searchParams }: DokumenPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "all";

  const cookieStore = await cookies();
  const viewPref = cookieStore.get("admin_view_preference")?.value;
  const view = typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : (viewPref === "grid" || viewPref === "list" ? viewPref : "grid");

  const page = toPositiveInteger(
    typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined,
    1
  );
  const limit = toPositiveInteger(
    typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : undefined,
    DEFAULT_PAGE_LIMITS.dokumen
  );

  const dokumenResult = await getDokumenListing({ q, filter, page, limit });

  const emptyState = (
    <EmptyState
      icon={FileText}
      title="Belum Ada Dokumen"
      description="Belum ada dokumen. Klik &quot;Tambah Dokumen&quot; untuk mengunggah PDF atau file Office."
      className="border border-dashed rounded-lg bg-muted/20"
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Manajemen Dokumen"
        description="Kelola dokumen (PDF/Office) yang tampil di halaman publik."
      >
        <Button render={<Link href="/admin/dokumen/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <Plus className="mr-2 h-5 w-5" />
          Tambah Dokumen
        </Button>
      </DashboardHeader>

      <ListingToolbar
        searchPlaceholder="Cari judul atau kategori dokumen..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua Kategori", value: "all" },
          ...dokumenResult.categories.map((category) => ({ label: category, value: category })),
        ]}
        currentLimit={limit}
        currentPage={dokumenResult.page}
        currentView={view as "list" | "grid"}
      />

      {view === "grid" ? (
        <DokumenGrid data={dokumenResult.items} emptyState={emptyState} />
      ) : (
        <DokumenTable data={dokumenResult.items} emptyState={emptyState} />
      )}

      <ListingPagination
        pathname="/admin/dokumen"
        query={{ q, filter, page: dokumenResult.page, limit }}
        page={dokumenResult.page}
        totalPages={dokumenResult.totalPages}
        totalItems={dokumenResult.totalItems}
        limitOptions={[12, 24, 48]}
        currentLimit={limit}
      />
    </div>
  );
}
