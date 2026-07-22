"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import type { DokumenRow } from "@/types"
import Link from "next/link"
import { CalendarDays, Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DeleteDokumenButton } from "@/components/admin/dokumen/delete-dokumen-button"
import { DataTable } from "@/components/admin/common/data-table"
import { DataTableColumnHeader } from "@/components/admin/common/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { FileTypeIcon, fileTypeLabel } from "@/components/dokumen/file-type-icon"

export const columns: ColumnDef<DokumenRow>[] = [
  {
    accessorKey: "tipe_file",
    header: "Tipe",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileTypeIcon tipe={row.original.tipe_file} className="h-6 w-6" />
        <span className="text-xs font-medium text-muted-foreground uppercase">{fileTypeLabel(row.original.tipe_file)}</span>
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
    accessorKey: "judul",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Judul & Deskripsi" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground text-sm line-clamp-1 max-w-[300px]">
          {row.original.judul || "Tanpa Judul"}
        </span>
        {row.original.deskripsi && (
          <span className="text-muted-foreground text-xs line-clamp-1 max-w-[300px]">
            {row.original.deskripsi}
          </span>
        )}
      </div>
    ),
  },
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
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const dok = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/dokumen/edit/${dok.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Edit Dokumen"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <DeleteDokumenButton
            id={dok.id}
            triggerVariant="ghost"
            triggerClassName="h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white"
          />
        </div>
      )
    },
  },
]

interface DokumenTableProps {
  data: DokumenRow[]
  emptyState?: React.ReactNode
}

export function DokumenTable({ data, emptyState }: DokumenTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  return <DataTable columns={columns} data={data} />
}
