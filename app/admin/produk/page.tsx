import { getProdukListing } from "@/lib/db/queries";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

import { EmptyState } from "@/components/admin/common/empty-state";
import { ListingPagination } from "@/components/admin/common/listing-pagination";
import { ListingToolbar } from "@/components/admin/common/listing-toolbar";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProdukGrid } from "./produk-grid";
import { ProdukTable } from "./produk-table";

export const metadata = {
  title: "Produk UMKM — Bintang Pertiwi",
};

interface ProdukPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminProdukPage({ searchParams }: ProdukPageProps) {
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
    DEFAULT_PAGE_LIMITS.produk
  );

  // Kontributor hanya melihat produk miliknya; super admin melihat semua.
  const session = await getSession();
  const ownerId = session?.role === "kontributor" ? session.id : undefined;

  const produkResult = await getProdukListing({ q, filter, page, limit, ownerId });

  const emptyState = (
    <EmptyState
      icon={ShoppingBag}
      title="Belum Ada Produk"
      description="Belum ada produk UMKM. Klik &quot;Tambah Produk&quot; untuk menambahkan data."
      className="border border-dashed rounded-lg bg-muted/20"
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Manajemen Produk UMKM"
        description="Kelola katalog produk UMKM yang tampil di halaman publik."
      >
        <Button render={<Link href="/admin/produk/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Tambah Produk
        </Button>
      </DashboardHeader>

      <ListingToolbar
        searchPlaceholder="Cari nama, kategori, atau SKU produk..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua Kategori", value: "all" },
          ...produkResult.categories.map((category) => ({ label: category, value: category })),
        ]}
        currentLimit={limit}
        currentPage={produkResult.page}
        currentView={view as "list" | "grid"}
      />

      {view === "grid" ? (
        <ProdukGrid data={produkResult.items} emptyState={emptyState} />
      ) : (
        <ProdukTable data={produkResult.items} emptyState={emptyState} />
      )}

      <ListingPagination
        pathname="/admin/produk"
        query={{ q, filter, page: produkResult.page, limit }}
        page={produkResult.page}
        totalPages={produkResult.totalPages}
        totalItems={produkResult.totalItems}
        limitOptions={[12, 24, 48]}
        currentLimit={limit}
      />
    </div>
  );
}
