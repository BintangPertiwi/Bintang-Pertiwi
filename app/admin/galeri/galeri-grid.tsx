"use client"

import * as React from "react"
import type { GaleriRow } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, CalendarDays, Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DeleteGaleriButton } from "@/components/admin/galeri/delete-galeri-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GaleriGridProps {
  data: GaleriRow[]
  emptyState?: React.ReactNode
}

export function GaleriGrid({ data, emptyState }: GaleriGridProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {data.map((galeri) => (
        <Card key={galeri.id} className="flex flex-col overflow-hidden h-full border-border/60 shadow-sm hover:shadow-md transition-all bg-card rounded-none p-0 gap-0">
          <div className="relative aspect-video w-full bg-card border-b flex shrink-0 items-center justify-center">
            {galeri.url_foto ? (
              <Image 
                src={galeri.url_foto} 
                alt={galeri.judul || "Foto Galeri"} 
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
              <Badge variant="outline" className="font-semibold text-[10px] uppercase tracking-wider bg-card/95 backdrop-blur-sm text-foreground rounded-full px-3 py-0.5 shadow-sm">
                {galeri.kategori}
              </Badge>
            </div>
          </div>
          <CardContent className="flex flex-col flex-1 px-4 py-3 justify-start items-start text-left">
            <h3 className="font-semibold text-[15px] line-clamp-2 mb-1 text-foreground leading-snug">
              {galeri.judul || "Tanpa Judul"}
            </h3>
            {galeri.deskripsi && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {galeri.deskripsi}
              </p>
            )}
            <div className="flex items-center justify-start gap-1.5 text-[11px] text-muted-foreground font-medium">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(galeri.tanggal_upload).toLocaleDateString("id-ID", {
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
              href={`/admin/galeri/edit/${galeri.id}`}
              className={buttonVariants({ variant: "ghost", className: "h-11 rounded-none text-muted-foreground hover:text-blue-700 hover:bg-muted font-medium text-xs uppercase tracking-wide" })}
              title="Detail Foto"
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Detail
            </Link>
            <DeleteGaleriButton 
              id={galeri.id} 
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
