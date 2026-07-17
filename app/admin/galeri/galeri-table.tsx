"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import type { GaleriRow } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, CalendarDays, Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DeleteGaleriButton } from "@/components/admin/galeri/delete-galeri-button"
import { DataTable } from "@/components/admin/common/data-table"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<GaleriRow>[] = [
  {
    accessorKey: "url_foto",
    header: "Foto",
    cell: ({ row }) => {
      const url = row.original.url_foto
      return url ? (
        <div className="relative h-12 w-16 rounded overflow-hidden shrink-0 bg-muted">
          <Image src={url} alt="Foto Galeri" fill className="object-cover" sizes="64px" />
        </div>
      ) : (
        <div className="flex h-12 w-16 items-center justify-center rounded bg-muted/50 text-muted-foreground shrink-0 border">
          <ImageIcon className="h-4 w-4 opacity-40" />
        </div>
      )
    },
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium text-foreground bg-muted">
        {row.original.kategori}
      </Badge>
    ),
  },
  {
    accessorKey: "judul",
    header: "Judul & Deskripsi",
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
    accessorKey: "tanggal_upload",
    header: "Tanggal Upload",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        {new Date(row.original.tanggal_upload).toLocaleDateString("id-ID", {
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
      const galeri = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/admin/galeri/edit/${galeri.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Edit Foto"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <DeleteGaleriButton 
            id={galeri.id} 
            triggerVariant="ghost"
            triggerClassName="h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white"
          />
        </div>
      )
    },
  },
]

interface GaleriTableProps {
  data: GaleriRow[]
  emptyState?: React.ReactNode
}

export function GaleriTable({ data, emptyState }: GaleriTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  return <DataTable columns={columns} data={data} />
}
