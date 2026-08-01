"use client"

import { DataTable } from "@/components/admin/common/data-table"
import { DataTableColumnHeader } from "@/components/admin/common/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { JurnalRow } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { CalendarDays, ImageIcon, Pencil } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DeleteJurnalButton } from "@/components/admin/penjualan/delete-jurnal-button"

import { DownloadNotaButton } from "@/components/admin/penjualan/download-nota-button"
import type { NotaBranding } from "@/lib/pdf/nota-generator"

export const getColumns = (branding: NotaBranding): ColumnDef<JurnalRow & { authorName?: string }>[] => [
  {
    accessorKey: "tanggal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        {new Date(row.original.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
    ),
  },
  {
    accessorKey: "nama_item",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produk / Item" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground line-clamp-2">
        {row.original.nama_item}
      </span>
    ),
  },
  {
    accessorKey: "jumlah_terjual",
    header: "Qty",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.jumlah_terjual}
      </Badge>
    ),
  },
  {
    accessorKey: "total_pendapatan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pendapatan" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        Rp {row.original.total_pendapatan.toLocaleString("id-ID")}
      </span>
    ),
  },
  {
    accessorKey: "url_nota",
    header: "Foto Nota",
    cell: ({ row }) => {
      const url = row.original.url_nota;
      return url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block relative h-12 w-16 rounded overflow-hidden shrink-0 bg-muted border border-border/40 hover:opacity-80 transition-opacity"
        >
          <Image src={url} alt="Nota" fill className="object-cover" sizes="64px" />
        </a>
      ) : (
        <div className="flex h-12 w-16 items-center justify-center rounded bg-muted/50 text-muted-foreground shrink-0 border border-border/40">
          <ImageIcon className="h-4 w-4 opacity-40" />
        </div>
      );
    },
  },
  {
    accessorKey: "authorName",
    header: "Dicatat Oleh",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.authorName || "-"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: function ActionCell({ row }) {
      const jurnal = row.original

      return (
        <div className="flex items-center justify-end gap-2">
          <DownloadNotaButton
            data={{
              id: jurnal.id,
              tanggal: jurnal.tanggal,
              nama_item: jurnal.nama_item,
              jumlah_terjual: jurnal.jumlah_terjual,
              total_pendapatan: jurnal.total_pendapatan,
              keterangan: jurnal.keterangan || "",
              authorName: jurnal.authorName || "",
            }}
            branding={branding}
            variant="outline"
          />
          <Link 
            href={`/admin/penjualan/edit/${jurnal.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Edit"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <DeleteJurnalButton
            id={jurnal.id}
            namaItem={jurnal.nama_item}
            triggerVariant="ghost"
            triggerClassName="h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors"
          />
        </div>
      )
    },
  },
]

function JurnalGridCard({ item, branding }: { item: JurnalRow & { authorName?: string }, branding: NotaBranding }) {
  return (
    <Card className="flex flex-col overflow-hidden h-full border-border/60 shadow-sm hover:shadow-md transition-all bg-card rounded-none p-0 gap-0">
      <div className="relative aspect-video w-full bg-card border-b flex shrink-0 items-center justify-center">
        {item.url_nota ? (
          <Image 
            src={item.url_nota} 
            alt={item.nama_item} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-40" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 z-10">
          {item.url_nota ? (
            <Badge variant="default" className="font-semibold text-[10px] uppercase tracking-wider bg-sky-600 hover:bg-sky-600 text-white rounded-full px-3 py-0.5 shadow-sm border-none">
              Ada Foto Nota
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-semibold text-[10px] uppercase tracking-wider bg-card/95 backdrop-blur-sm text-muted-foreground rounded-full px-3 py-0.5 shadow-sm">
              Tanpa Foto
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className="font-semibold text-[10px] bg-card/95 backdrop-blur-sm text-foreground rounded-full px-3 py-0.5 shadow-sm font-mono border-border/60">
            x{item.jumlah_terjual}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-col flex-1 px-4 py-3 justify-start items-start text-left gap-1">
        <h3 className="font-semibold text-[15px] line-clamp-2 text-foreground leading-snug">
          {item.nama_item}
        </h3>
        
        <div className="text-lg font-bold text-primary">
          Rp {item.total_pendapatan.toLocaleString("id-ID")}
        </div>

        {item.keterangan && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 border-t pt-1.5 w-full">
            {item.keterangan}
          </p>
        )}

        <div className="flex items-center justify-between w-full mt-auto pt-2 text-[11px] text-muted-foreground font-medium border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(item.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          {item.authorName && item.authorName !== "-" && (
            <span>oleh {item.authorName}</span>
          )}
        </div>
      </CardContent>

      <div className="grid grid-cols-3 border-t bg-card shrink-0">
        <DownloadNotaButton
          data={{
            id: item.id,
            tanggal: item.tanggal,
            nama_item: item.nama_item,
            jumlah_terjual: item.jumlah_terjual,
            total_pendapatan: item.total_pendapatan,
            keterangan: item.keterangan || "",
            authorName: item.authorName || "",
          }}
          branding={branding}
          variant="ghost"
          showText={true}
          className="h-11 rounded-none text-muted-foreground hover:text-green-700 hover:bg-muted font-medium text-xs uppercase tracking-wide"
        />
        <Link 
          href={`/admin/penjualan/edit/${item.id}`}
          className={buttonVariants({ variant: "ghost", className: "h-11 rounded-none text-muted-foreground hover:text-blue-700 hover:bg-muted font-medium text-xs uppercase tracking-wide" })}
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5 mr-2" />
          Edit
        </Link>
        <DeleteJurnalButton
          id={item.id}
          namaItem={item.nama_item}
          triggerVariant="ghost"
          showText={true}
          triggerClassName="h-11 w-full rounded-none text-red-600 bg-red-50 hover:bg-red-600 hover:text-white font-medium text-xs uppercase tracking-wide"
        />
      </div>
    </Card>
  )
}

interface JurnalTableProps {
  data: (JurnalRow & { authorName?: string })[]
  branding: NotaBranding
  view?: "list" | "grid"
  emptyState?: React.ReactNode
}

export function JurnalTable({ data, branding, view = "list", emptyState }: JurnalTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <JurnalGridCard key={item.id} item={item} branding={branding} />
        ))}
      </div>
    )
  }

  return <DataTable columns={getColumns(branding)} data={data} />
}
