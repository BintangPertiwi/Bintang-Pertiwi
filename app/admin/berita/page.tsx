import Link from "next/link";
import { cookies } from "next/headers";
import { PlusCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBeritaListing } from "@/lib/db/queries";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { EmptyState } from "@/components/admin/common/empty-state";
import { ListingToolbar } from "@/components/admin/common/listing-toolbar";
import { ListingPagination } from "@/components/admin/common/listing-pagination";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";
import { BeritaTable } from "./berita-table";
import { BeritaGrid } from "./berita-grid";

import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Manajemen Berita — Bintang Pertiwi",
};

interface BeritaPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BeritaPage({ searchParams }: BeritaPageProps) {
  const session = await getSession();
  const ownerId = session?.role === "kontributor" ? session.id : undefined;

  const resolvedSearchParams = (await searchParams) ?? {};
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "all";
  const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "all";
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : undefined;
  const dir = typeof resolvedSearchParams.dir === "string" ? resolvedSearchParams.dir : undefined;
  
  const cookieStore = await cookies();
  const viewPref = cookieStore.get("admin_view_preference")?.value;
  const view = typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : (viewPref === "grid" || viewPref === "list" ? viewPref : "list");
  
  const page = toPositiveInteger(
    typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined,
    1
  );
  const limit = toPositiveInteger(
    typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : undefined,
    DEFAULT_PAGE_LIMITS.berita
  );

  const beritaResult = await getBeritaListing({
    q,
    filter,
    status,
    page,
    limit,
    sort,
    dir,
    ownerId,
  });

  const emptyState = (
    <EmptyState 
      icon={Inbox}
      title="Belum ada berita"
      description="Belum ada berita yang diterbitkan."
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Berita & Pengumuman" 
        description="Kelola publikasi artikel berita dan pengumuman untuk warga."
      >
        <Button render={<Link href="/admin/berita/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <PlusCircle className="mr-2 h-5 w-5" />
          Tulis Berita
        </Button>
      </DashboardHeader>

      <ListingToolbar
        searchPlaceholder="Cari judul atau ringkasan berita..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua Kategori", value: "all" },
          ...beritaResult.categories.map((cat) => ({
            label: cat,
            value: cat,
          })),
        ]}
        activeStatusFilter={status}
        statusOptions={[
          { label: "Semua Status", value: "all" },
          { label: "Publik", value: "Publik" },
          { label: "Draf", value: "Draf" },
          { label: "Arsip", value: "Arsip" },
        ]}
        currentLimit={limit}
        currentPage={beritaResult.page}
        currentView={view as "list" | "grid"}
      />

      {view === "grid" ? (
        <BeritaGrid 
          data={beritaResult.items} 
          emptyState={emptyState} 
        />
      ) : (
        <BeritaTable 
          data={beritaResult.items} 
          emptyState={emptyState} 
        />
      )}

      <ListingPagination
        pathname="/admin/berita"
        query={{ q, filter, status, page: beritaResult.page, limit, sort, dir }}
        page={beritaResult.page}
        totalPages={beritaResult.totalPages}
        totalItems={beritaResult.totalItems}
        limitOptions={[10, 20, 50]}
        currentLimit={limit}
      />
    </div>
  );
}
