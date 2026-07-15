import { EmptyState } from "@/components/admin/common/empty-state";
import { ListingPagination } from "@/components/admin/common/listing-pagination";
import { ListingToolbar } from "@/components/admin/common/listing-toolbar";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PengaduanGrid } from "@/components/admin/pengaduan/pengaduan-grid";
import { PengaduanTable } from "@/components/admin/pengaduan/pengaduan-table";
import { getPengaduanListing } from "@/lib/db/queries/pengaduan";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";
import { Inbox } from "lucide-react";
import { cookies } from "next/headers";

export const metadata = {
  title: "Kelola Pengaduan Warga — Admin Bintang Pertiwi",
};

interface PengaduanPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPengaduanPage({ searchParams }: PengaduanPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "all";
  const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "all";
  
  const cookieStore = await cookies();
  const viewPref = cookieStore.get("admin_view_preference")?.value;
  const view = typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : (viewPref === "grid" || viewPref === "list" ? viewPref : "list");
  
  const page = toPositiveInteger(
    typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined,
    1
  );
  const limit = toPositiveInteger(
    typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : undefined,
    DEFAULT_PAGE_LIMITS.pengaduan || 10
  );

  const pengaduanResult = await getPengaduanListing({
    q,
    filter,
    status,
    page,
    limit,
  });

  const emptyState = (
    <EmptyState 
      icon={Inbox}
      title="Belum ada pengaduan"
      description="Belum ada laporan pengaduan masuk dari warga."
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaduan Warga" 
        description="Kelola laporan dan keluhan yang masuk dari warga dusun."
      />

      <ListingToolbar
        searchPlaceholder="Cari nama, NIK, atau isi laporan..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua Kategori", value: "all" },
          ...pengaduanResult.categories.map((cat: string) => ({
            label: cat,
            value: cat,
          })),
        ]}
        activeStatusFilter={status}
        statusOptions={[
          { label: "Semua Status", value: "all" },
          { label: "Menunggu", value: "Menunggu" },
          { label: "Diproses", value: "Diproses" },
          { label: "Selesai", value: "Selesai" },
          { label: "Ditolak", value: "Ditolak" },
        ]}
        currentLimit={limit}
        currentPage={pengaduanResult.page}
        currentView={view as "list" | "grid"}
      />

      {view === "grid" ? (
        <PengaduanGrid data={pengaduanResult.items} emptyState={emptyState} />
      ) : (
        <PengaduanTable data={pengaduanResult.items} emptyState={emptyState} />
      )}

      <ListingPagination
        pathname="/admin/pengaduan"
        query={{ q, filter, status, page: pengaduanResult.page, limit }}
        page={pengaduanResult.page}
        totalPages={pengaduanResult.totalPages}
        totalItems={pengaduanResult.totalItems}
        limitOptions={[10, 20, 50]}
        currentLimit={limit}
      />
    </div>
  );
}
