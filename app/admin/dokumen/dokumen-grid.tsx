"use client"

import * as React from "react"
import type { DokumenRow } from "@/types"
import Link from "next/link"
import { CalendarDays, Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DeleteDokumenButton } from "@/components/admin/dokumen/delete-dokumen-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileTypeIcon, fileTypeLabel } from "@/components/dokumen/file-type-icon"

interface DokumenGridProps {
  data: DokumenRow[]
  emptyState?: React.ReactNode
}

export function DokumenGrid({ data, emptyState }: DokumenGridProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {data.map((dok) => (
        <Card key={dok.id} className="flex flex-col overflow-hidden h-full border-border/60 shadow-sm hover:shadow-md transition-all bg-card rounded-none p-0 gap-0">
          <div className="relative aspect-video w-full bg-muted/40 border-b flex shrink-0 items-center justify-center">
            <FileTypeIcon tipe={dok.tipe_file} className="h-14 w-14" />
            {dok.kategori && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="outline" className="font-semibold text-[10px] uppercase tracking-wider bg-card/95 backdrop-blur-sm text-foreground rounded-full px-3 py-0.5 shadow-sm">
                  {dok.kategori}
                </Badge>
              </div>
            )}
            <div className="absolute bottom-3 right-3 z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {fileTypeLabel(dok.tipe_file)}
              </span>
            </div>
          </div>
          <CardContent className="flex flex-col flex-1 px-4 py-3 justify-start items-start text-left">
            <h3 className="font-semibold text-[15px] line-clamp-2 mb-1 text-foreground leading-snug">
              {dok.judul || "Tanpa Judul"}
            </h3>
            {dok.deskripsi && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {dok.deskripsi}
              </p>
            )}
            <div className="flex items-center justify-start gap-1.5 text-[11px] text-muted-foreground font-medium">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(dok.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </CardContent>
          <div className="grid grid-cols-2 border-t bg-card shrink-0">
            <Link
              href={`/admin/dokumen/edit/${dok.id}`}
              className={buttonVariants({ variant: "ghost", className: "h-11 rounded-none text-muted-foreground hover:text-blue-700 hover:bg-muted font-medium text-xs uppercase tracking-wide" })}
              title="Edit Dokumen"
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Edit
            </Link>
            <DeleteDokumenButton
              id={dok.id}
              triggerVariant="ghost"
              showText={true}
              triggerClassName="h-11 w-full rounded-none text-red-600 bg-red-50 hover:bg-red-600 hover:text-white font-medium text-xs uppercase tracking-wide"
            />
          </div>
        </Card>
      ))}
    </div>
  )
}
