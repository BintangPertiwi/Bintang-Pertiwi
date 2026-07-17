"use client"

import { DeleteBeritaButton } from "@/components/admin/berita/delete-berita-button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BeritaRow } from "@/types"
import { CalendarDays, ImageIcon, Pencil } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

function StatusBadge({ status }: { status: string }) {
  if (status === "Draf") return <Badge variant="secondary" className="absolute top-3 left-3 text-orange-800 border-orange-800 shadow-sm">Draf</Badge>
  if (status === "Arsip") return <Badge variant="secondary" className="absolute top-3 left-3 text-foreground border-border shadow-sm">Arsip</Badge>
  return <Badge variant="default" className="absolute top-3 left-3 text-white border-primary shadow-sm">Publik</Badge>
}

interface BeritaGridProps {
  data: BeritaRow[]
  emptyState?: React.ReactNode
}

export function BeritaGrid({ data, emptyState }: BeritaGridProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {data.map((berita) => (
        <Card key={berita.id} className="flex flex-col overflow-hidden h-full border-border/60 shadow-sm hover:shadow-md transition-all bg-card rounded-none p-0 gap-0">
          <div className="relative aspect-video w-full bg-card border-b flex shrink-0 items-center justify-center">
            {berita.url_foto ? (
              <Image 
                src={berita.url_foto} 
                alt={berita.judul} 
                fill 
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 opacity-40" />
              </div>
            )}
            <StatusBadge status={berita.status_publikasi || "Publik"} />
          </div>
          <CardContent className="flex flex-col flex-1 px-4 py-3 justify-start items-start text-left">
            <h3 className="font-semibold text-[15px] line-clamp-2 mb-2 text-foreground leading-snug">
              {berita.judul}
            </h3>
            <div className="flex items-center justify-start gap-1.5 text-[11px] text-muted-foreground font-medium">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(berita.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </CardContent>
          <div className="grid grid-cols-2 border-t bg-card shrink-0">
            <Link 
              href={`/admin/berita/edit/${berita.id}`}
              className={buttonVariants({ variant: "ghost", className: "h-11 rounded-none text-muted-foreground hover:text-blue-700 hover:bg-muted font-medium text-xs uppercase tracking-wide" })}
              title="Detail Berita"
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Detail
            </Link>
            <DeleteBeritaButton 
              id={berita.id} 
              judul={berita.judul} 
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
