"use client"

import { DeleteBeritaButton } from "@/components/admin/berita/delete-berita-button"
import { DataTable } from "@/components/admin/common/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import type { BeritaRow } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { CalendarDays, ImageIcon, Pencil } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

function StatusBadge({ status }: { status: string }) {
  if (status === "Draf") return <Badge variant="secondary" className="text-orange-800 border-orange-800">Draf</Badge>
  if (status === "Arsip") return <Badge variant="secondary" className="text-foreground border-border">Arsip</Badge>
  return <Badge variant="default" className="text-white border-primary">Publik</Badge>
}

export const columns: ColumnDef<BeritaRow>[] = [
  {
    accessorKey: "url_foto",
    header: "Cover",
    cell: ({ row }) => {
      const url = row.original.url_foto
      return url ? (
        <div className="relative h-12 w-16 rounded overflow-hidden shrink-0 bg-muted">
          <Image src={url} alt="Cover" fill className="object-cover" sizes="64px" />
        </div>
      ) : (
        <div className="flex h-12 w-16 items-center justify-center rounded bg-muted/50 text-muted-foreground shrink-0 border">
          <ImageIcon className="h-4 w-4 opacity-40" />
        </div>
      )
    },
  },
  {
    accessorKey: "judul",
    header: "Judul",
    cell: ({ row }) => (
      <span className="font-medium text-foreground line-clamp-2 max-w-[250px]">
        {row.original.judul}
      </span>
    ),
  },
  {
    accessorKey: "ringkasan",
    header: "Ringkasan",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm line-clamp-2 max-w-[300px]">
        {row.original.ringkasan || "-"}
      </span>
    ),
  },
  {
    accessorKey: "status_publikasi",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status_publikasi || "Publik"} />
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal Publikasi",
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
      const berita = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/admin/berita/edit/${berita.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Edit Berita"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <DeleteBeritaButton 
            id={berita.id} 
            judul={berita.judul} 
            triggerVariant="ghost"
            triggerClassName="h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white"
          />
        </div>
      )
    },
  },
]

interface BeritaTableProps {
  data: BeritaRow[]
  emptyState?: React.ReactNode
}

export function BeritaTable({ data, emptyState }: BeritaTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  return <DataTable columns={columns} data={data} />
}
