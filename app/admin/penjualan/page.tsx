import { ListingPagination } from "@/components/admin/common/listing-pagination"
import { ListingToolbar } from "@/components/admin/common/listing-toolbar"
import { DashboardHeader } from "@/components/admin/layout/dashboard-header"
import { EmptyState } from "@/components/admin/common/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { getJurnalChartData, getJurnalListing, getJurnalFilterOptions } from "@/lib/db/queries/jurnal"
import { FileText, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { JurnalChart } from "./jurnal-chart"
import { JurnalTable } from "./jurnal-table"
import { JurnalFilters } from "./jurnal-filters"
import { toPositiveInteger } from "@/lib/listing"

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

  const [jurnalResult, chartData, filterOptions] = await Promise.all([
    getJurnalListing({ q, filter, month, year, product, page, limit, sort, dir, ownerId }),
    getJurnalChartData({ ownerId, month, year, product }),
    getJurnalFilterOptions(ownerId)
  ])

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
        currentView="list"
      >
        <JurnalFilters 
          currentQuery={{ q, filter, page, limit, sort, dir, month, year, product }} 
          options={filterOptions} 
        />
      </ListingToolbar>

      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat data...</div>}>
        <JurnalTable 
          data={jurnalResult.items} 
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
