import { ListingPagination } from "@/components/admin/common/listing-pagination"
import { ListingToolbar } from "@/components/admin/common/listing-toolbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { getJurnalChartData, getJurnalListing } from "@/lib/db/queries/jurnal"
import { FileText, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { JurnalChart } from "./jurnal-chart"
import { JurnalTable } from "./jurnal-table"

export const metadata = {
  title: "Jurnal Penjualan — Bintang Pertiwi",
}

export default async function PenjualanPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const session = await getSession()
  const q = searchParams.q || ""
  const filter = searchParams.filter || "all"
  const page = Number.parseInt(searchParams.page || "1", 10)
  const limit = Number.parseInt(searchParams.limit || "10", 10)
  const sort = searchParams.sort
  const dir = searchParams.dir
  const ownerId = session?.role === "kontributor" ? session.id : undefined

  const [jurnalResult, chartData] = await Promise.all([
    getJurnalListing({ q, filter, page, limit, sort, dir, ownerId }),
    getJurnalChartData(ownerId)
  ])

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col mobile:flex-col tablet:flex-row tablet:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Jurnal Penjualan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Catat dan pantau riwayat penjualan produk UMKM Anda.
          </p>
        </div>
        <Link href="/admin/penjualan/create">
          <Button className="w-full tablet:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Jurnal
          </Button>
        </Link>
      </div>

      {chartData && chartData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base">Ringkasan Pendapatan</CardTitle>
            <CardDescription>Berdasarkan total pendapatan per produk</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <JurnalChart data={chartData} />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <div className="p-4 border-b border-border bg-muted/10">
          <ListingToolbar
            searchPlaceholder="Cari nama produk..."
            searchValue={q}
            activeFilter={filter}
            filterOptions={[
              { label: "Semua Waktu", value: "all" },
              { label: "Bulan Ini", value: "bulan_ini" },
              { label: "Tahun Ini", value: "tahun_ini" },
            ]}
            currentLimit={limit}
            currentPage={page}
            currentView="list"
          />
        </div>
        <div className="p-0">
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat data...</div>}>
            <JurnalTable 
              data={jurnalResult.items} 
              emptyState={
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">Belum ada pencatatan</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
                    Silakan klik tombol Tambah Jurnal untuk merekam riwayat penjualan produk Anda.
                  </p>
                  <Link href="/admin/penjualan/create">
                    <Button variant="outline">Mulai Pencatatan</Button>
                  </Link>
                </div>
              } 
            />
          </Suspense>
        </div>
        
        {jurnalResult.totalPages > 1 && (
          <div className="p-4 border-t border-border bg-muted/10 flex justify-center">
            <ListingPagination
              pathname="/admin/penjualan"
              query={{ q, filter, page, limit, sort, dir }}
              page={jurnalResult.page}
              totalPages={jurnalResult.totalPages}
              totalItems={jurnalResult.totalItems}
              limitOptions={[10, 20, 50]}
              currentLimit={limit}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
