import { getPetaListing } from "@/lib/google-sheets";


import { EmptyState } from "@/components/admin/common/empty-state";
import { ListingPagination } from "@/components/admin/common/listing-pagination";
import { ListingToolbar } from "@/components/admin/common/listing-toolbar";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PetaTable } from "@/components/admin/peta/peta-table";
import { PetaGrid } from "@/components/admin/peta/peta-grid";
import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata = {
  title: "Peta — Bintang Pertiwi",
};

interface PetaPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPetaPage({ searchParams }: PetaPageProps) {
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
    DEFAULT_PAGE_LIMITS.galeri // Use same limit as galeri for now (12)
  );

  const petaResult = await getPetaListing({
    q,
    filter,
    page,
    limit,
  });

  const emptyState = (
    <EmptyState 
      icon={MapPin}
      title="Tidak Ada Fasilitas"
      description="Belum ada fasilitas di peta. Klik &quot;Tambah Fasilitas&quot; untuk menambahkan data."
      className="border border-dashed rounded-lg bg-muted/20"
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Manajemen Peta & GIS" 
        description="Kelola data fasilitas yang ditampilkan di peta interaktif."
      >
        <Button render={<Link href="/admin/peta/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <MapPin className="mr-2 h-5 w-5" />
          Tambah Fasilitas
        </Button>
      </DashboardHeader>

      <ListingToolbar
        searchPlaceholder="Cari nama atau kategori fasilitas..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua Kategori", value: "all" },
          ...petaResult.categories.map((category) => ({ label: category, value: category })),
        ]}
        currentLimit={limit}
        currentPage={petaResult.page}
        currentView={view as "list" | "grid"}
      />

      {view === "grid" ? (
        <PetaGrid 
          data={petaResult.items} 
          emptyState={emptyState} 
        />
      ) : (
        <PetaTable 
          data={petaResult.items} 
          emptyState={emptyState} 
        />
      )}

      <ListingPagination
        pathname="/admin/peta"
        query={{ q, filter, page: petaResult.page, limit }}
        page={petaResult.page}
        totalPages={petaResult.totalPages}
        totalItems={petaResult.totalItems}
        limitOptions={[12, 24, 48]}
        currentLimit={limit}
      />
    </div>
  );
}
