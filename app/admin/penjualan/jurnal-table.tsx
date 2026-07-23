"use client"

import { DataTable } from "@/components/admin/common/data-table"
import { DataTableColumnHeader } from "@/components/admin/common/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import type { JurnalRow } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { CalendarDays, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const columns: ColumnDef<JurnalRow & { authorName?: string }>[] = [
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
      <span className="font-semibold text-green-700 dark:text-green-400">
        Rp {row.original.total_pendapatan.toLocaleString("id-ID")}
      </span>
    ),
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
      const router = useRouter()
      const [isDeleting, setIsDeleting] = React.useState(false)

      const handleDelete = async () => {
        if (!confirm(`Hapus pencatatan ${jurnal.nama_item}?`)) return
        setIsDeleting(true)
        try {
          const res = await fetch(`/api/jurnal/${jurnal.id}`, { method: "DELETE" })
          if (!res.ok) throw new Error("Gagal menghapus")
          toast.success("Catatan berhasil dihapus")
          router.refresh()
        } catch {
          toast.error("Terjadi kesalahan saat menghapus catatan")
        } finally {
          setIsDeleting(false)
        }
      }

      return (
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/admin/penjualan/edit/${jurnal.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Edit"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
  },
]

function JurnalGridCard({ item }: { item: JurnalRow & { authorName?: string } }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!confirm(`Hapus pencatatan ${item.nama_item}?`)) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/jurnal/${item.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Gagal menghapus")
      toast.success("Catatan berhasil dihapus")
      router.refresh()
    } catch {
      toast.error("Terjadi kesalahan saat menghapus catatan")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground line-clamp-1">{item.nama_item}</span>
          <Badge variant="outline" className="font-mono shrink-0 ml-2">
            x{item.jumlah_terjual}
          </Badge>
        </div>
        <div className="text-xl font-bold text-green-700 dark:text-green-400">
          Rp {item.total_pendapatan.toLocaleString("id-ID")}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {new Date(item.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {item.authorName && item.authorName !== "-" && (
            <span className="ml-auto">oleh {item.authorName}</span>
          )}
        </div>
        {item.keterangan && (
          <p className="text-xs text-muted-foreground line-clamp-2 border-t pt-2">
            {item.keterangan}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <Link 
            href={`/admin/penjualan/edit/${item.id}`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1 h-9" })}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-3 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

interface JurnalTableProps {
  data: (JurnalRow & { authorName?: string })[]
  view?: "list" | "grid"
  emptyState?: React.ReactNode
}

export function JurnalTable({ data, view = "list", emptyState }: JurnalTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  if (view === "grid") {
    return (
      <div className="grid gap-4 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
        {data.map((item) => (
          <JurnalGridCard key={item.id} item={item} />
        ))}
      </div>
    )
  }

  return <DataTable columns={columns} data={data} />
}
