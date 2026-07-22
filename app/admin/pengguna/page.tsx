import { getUserListing } from "@/lib/db/queries";
import { getSession } from "@/lib/auth";
import { EmptyState } from "@/components/admin/common/empty-state";
import { ListingPagination } from "@/components/admin/common/listing-pagination";
import { ListingToolbar } from "@/components/admin/common/listing-toolbar";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { PenggunaTable } from "./pengguna-table";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manajemen Pengguna — Bintang Pertiwi",
};

interface PenggunaPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPenggunaPage({ searchParams }: PenggunaPageProps) {
  const session = await getSession();
  
  if (!session || session.role !== "super_admin") {
    redirect("/admin");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "all";
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : undefined;
  const dir = typeof resolvedSearchParams.dir === "string" ? resolvedSearchParams.dir : undefined;
  
  const page = toPositiveInteger(
    typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined,
    1
  );
  const limit = toPositiveInteger(
    typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : undefined,
    DEFAULT_PAGE_LIMITS.pengguna
  );

  const penggunaResult = await getUserListing({
    q,
    filter,
    page,
    limit,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Manajemen Pengguna" 
        description="Buat dan kelola akun Super Admin & Kontributor (pelaku UMKM)."
      >
        <Button render={<Link href="/admin/pengguna/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <UserPlus className="mr-2 h-5 w-5" />
          Tambah Akun
        </Button>
      </DashboardHeader>

      <ListingToolbar
        searchPlaceholder="Cari nama atau username..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua Peran", value: "all" },
          { label: "Super Admin", value: "super_admin" },
          { label: "Kontributor", value: "kontributor" },
        ]}
        currentLimit={limit}
        currentPage={penggunaResult.page}
        currentView="list"
      />

      <PenggunaTable 
        data={penggunaResult.items} 
        currentUserId={session.id}
        emptyState={
          <EmptyState 
            icon={Users}
            title="Belum Ada Pengguna Lain"
            description="Klik &quot;Tambah Akun&quot; untuk mendaftarkan kontributor atau admin baru."
            className="border border-dashed rounded-lg bg-muted/20"
          />
        } 
      />

      <ListingPagination
        pathname="/admin/pengguna"
        query={{ q, filter, page: penggunaResult.page, limit, sort, dir }}
        page={penggunaResult.page}
        totalPages={penggunaResult.totalPages}
        totalItems={penggunaResult.totalItems}
        limitOptions={[10, 20, 50]}
        currentLimit={limit}
      />
    </div>
  );
}
