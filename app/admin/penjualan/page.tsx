import { ListingPagination } from "@/components/admin/common/listing-pagination"
import { ListingToolbar } from "@/components/admin/common/listing-toolbar"
import { DashboardHeader } from "@/components/admin/layout/dashboard-header"
import { EmptyState } from "@/components/admin/common/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { getJurnalChartData, getJurnalListing, getJurnalFilterOptions, getJurnalStats } from "@/lib/db/queries/jurnal"
import { Banknote, FileText, Package, PlusCircle, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { JurnalChart } from "./jurnal-chart"
import { JurnalTable } from "./jurnal-table"
import { JurnalFilters } from "./jurnal-filters"
import { toPositiveInteger } from "@/lib/listing"
import { cookies } from "next/headers"

export const metadata = {
  title: "Jurnal Penjualan — Bintang Pertiwi",
}

interface PenjualanPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function PenjualanPage({ searchParams }: PenjualanPageProps) {
  const session = await getSession()
  const resolvedSearchParams = (await searchParams) ?? {}
  
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : ""
  const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "all"
  const page = toPositiveInteger(
    typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined,
    1
  )
  const limit = toPositiveInteger(
    typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : undefined,
    10
  )
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : undefined
  const dir = typeof resolvedSearchParams.dir === "string" ? resolvedSearchParams.dir : undefined
  const month = typeof resolvedSearchParams.month === "string" ? resolvedSearchParams.month : undefined
  const year = typeof resolvedSearchParams.year === "string" ? resolvedSearchParams.year : undefined
  const product = typeof resolvedSearchParams.product === "string" ? resolvedSearchParams.product : undefined
  const ownerId = session?.role === "kontributor" ? session.id : undefined

  const cookieStore = await cookies()
  const savedView = cookieStore.get("admin_view_preference")?.value as "list" | "grid" | undefined
  const view = (typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : savedView) as "list" | "grid" | undefined

  const hasActiveFilters = Boolean(month || year || product)

  const [jurnalResult, chartData, filterOptions, stats] = await Promise.all([
    getJurnalListing({ q, filter, month, year, product, page, limit, sort, dir, ownerId }),
    getJurnalChartData({ ownerId, month, year, product }),
    getJurnalFilterOptions(ownerId),
    getJurnalStats(ownerId),
  ])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Jurnal Penjualan" 
        description="Catat dan pantau riwayat penjualan produk UMKM Anda."
      >
        <Button render={<Link href="/admin/penjualan/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <PlusCircle className="mr-2 h-5 w-5" />
          Tambah Jurnal
        </Button>
      </DashboardHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(stats.totalPendapatan)}</div>
            <p className="text-xs text-muted-foreground mt-1">Akumulasi seluruh transaksi</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jenis Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProduk}</div>
            <p className="text-xs text-muted-foreground mt-1">Produk unik tercatat</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kuantitas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQty.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground mt-1">Item terjual</p>
          </CardContent>
        </Card>
      </div>

      {(chartData.pieData.length > 0 || chartData.lineData.length > 0) && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base">Ringkasan Pendapatan</CardTitle>
            <CardDescription>Visualisasi pendapatan penjualan produk</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <JurnalChart data={chartData} />
          </CardContent>
        </Card>
      )}

      <ListingToolbar
        searchPlaceholder="Cari nama produk..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[]}
        currentLimit={limit}
        currentPage={page}
        currentView={view || "list"}
        hasExternalFilters={hasActiveFilters}
      >
        <JurnalFilters 
          currentQuery={{ q, filter, page, limit, sort, dir, month, year, product }} 
          options={filterOptions} 
        />
      </ListingToolbar>

      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat data...</div>}>
        <JurnalTable 
          data={jurnalResult.items} 
          view={view || "list"}
          emptyState={
            <EmptyState 
              icon={FileText}
              title="Belum ada pencatatan"
              description="Silakan klik tombol Tambah Jurnal untuk merekam riwayat penjualan produk Anda."
              action={
                <Button render={<Link href="/admin/penjualan/create" />} nativeButton={false} variant="outline">
                  Mulai Pencatatan
                </Button>
              }
            />
          } 
        />
      </Suspense>
      
      {jurnalResult.totalPages > 1 && (
        <ListingPagination
          pathname="/admin/penjualan"
          query={{ q, filter, page, limit, sort, dir, month, year, product }}
          page={jurnalResult.page}
          totalPages={jurnalResult.totalPages}
          totalItems={jurnalResult.totalItems}
          limitOptions={[10, 20, 50]}
          currentLimit={limit}
        />
      )}
    </div>
  )
}
