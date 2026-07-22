"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import type { ProdukRow } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DeleteProdukButton } from "@/components/admin/produk/delete-produk-button"
import { DataTable } from "@/components/admin/common/data-table"
import { DataTableColumnHeader } from "@/components/admin/common/data-table-column-header"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<ProdukRow>[] = [
  {
    accessorKey: "gambar_urls",
    header: "Gambar",
    cell: ({ row }) => {
      const url = row.original.gambar_urls[0]
      return url ? (
        <div className="relative h-12 w-16 rounded overflow-hidden shrink-0 bg-muted">
          <Image src={url} alt={row.original.nama} fill className="object-cover" sizes="64px" />
        </div>
      ) : (
        <div className="flex h-12 w-16 items-center justify-center rounded bg-muted/50 text-muted-foreground shrink-0 border">
          <ImageIcon className="h-4 w-4 opacity-40" />
        </div>
      )
    },
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground text-sm line-clamp-1 max-w-[280px]">
          {row.original.nama}
        </span>
        {row.original.sku && (
          <span className="text-muted-foreground text-xs line-clamp-1">SKU: {row.original.sku}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium text-foreground bg-muted">
        {row.original.kategori || "-"}
      </Badge>
    ),
  },
  {
    accessorKey: "harga",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-foreground text-sm">
          Rp {row.original.harga.toLocaleString("id-ID")}
          {row.original.satuan && (
            <span className="text-muted-foreground text-xs font-medium"> / {row.original.satuan}</span>
          )}
        </span>
        {row.original.harga_coret ? (
          <span className="text-muted-foreground text-xs line-through">
            Rp {row.original.harga_coret.toLocaleString("id-ID")}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "stok",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok" />
    ),
    cell: ({ row }) =>
      row.original.stok === "Tersedia" ? (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-full">Tersedia</Badge>
      ) : (
        <Badge variant="destructive" className="rounded-full">Habis</Badge>
      ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const produk = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/produk/edit/${produk.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Edit Produk"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <DeleteProdukButton
            id={produk.id}
            triggerVariant="ghost"
            triggerClassName="h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white"
          />
        </div>
      )
    },
  },
]

interface ProdukTableProps {
  data: ProdukRow[]
  emptyState?: React.ReactNode
}

export function ProdukTable({ data, emptyState }: ProdukTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  return <DataTable columns={columns} data={data} />
}
