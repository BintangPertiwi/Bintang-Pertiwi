import { getGaleriListing } from "@/lib/db/queries";
import { cookies } from "next/headers";

import { EmptyState } from "@/components/admin/common/empty-state";
import { ListingPagination } from "@/components/admin/common/listing-pagination";
import { ListingToolbar } from "@/components/admin/common/listing-toolbar";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { GaleriGrid } from "./galeri-grid";
import { GaleriTable } from "./galeri-table";

export const metadata = {
  title: "Galeri — Bintang Pertiwi",
};

interface GaleriPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminGaleriPage({ searchParams }: GaleriPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "all";
  
  const cookieStore = await cookies();
  const viewPref = cookieStore.get("admin_view_preference")?.value;
  const view = typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : (viewPref === "grid" || viewPref === "list" ? viewPref : "list");
  
  const page = toPositiveInteger(
    typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined,
    1
  );
  const limit = toPositiveInteger(
    typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : undefined,
    DEFAULT_PAGE_LIMITS.galeri
  );

  const galeriResult = await getGaleriListing({
    q,
    filter,
    page,
    limit,
  });

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Manajemen Galeri" 
        description="Kelola foto kegiatan, fasilitas, dan momen penting di dusun."
      >
        <Button render={<Link href="/admin/galeri/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <ImageIcon className="mr-2 h-5 w-5" />
          Unggah Foto
        </Button>
      </DashboardHeader>

      <ListingToolbar
        searchPlaceholder="Cari kategori atau caption foto..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua Kategori", value: "all" },
          ...galeriResult.categories.map((category) => ({ label: category, value: category })),
        ]}
        currentLimit={limit}
        currentPage={galeriResult.page}
        currentView={view as "list" | "grid"}
      />

      {view === "grid" ? (
        <GaleriGrid 
          data={galeriResult.items} 
          emptyState={
            <EmptyState 
              icon={ImageIcon}
              title="Galeri Masih Kosong"
              description="Belum ada foto di galeri. Klik &quot;Unggah Foto&quot; untuk menambahkan data."
              className="border border-dashed rounded-lg bg-muted/20"
            />
          } 
        />
      ) : (
        <GaleriTable 
          data={galeriResult.items} 
          emptyState={
            <EmptyState 
              icon={ImageIcon}
              title="Galeri Masih Kosong"
              description="Belum ada foto di galeri. Klik &quot;Unggah Foto&quot; untuk menambahkan data."
              className="border border-dashed rounded-lg bg-muted/20"
            />
          } 
        />
      )}

      <ListingPagination
        pathname="/admin/galeri"
        query={{ q, filter, page: galeriResult.page, limit }}
        page={galeriResult.page}
        totalPages={galeriResult.totalPages}
        totalItems={galeriResult.totalItems}
        limitOptions={[12, 24, 48]}
        currentLimit={limit}
      />
    </div>
  );
}
