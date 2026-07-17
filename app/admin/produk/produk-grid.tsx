"use client"

import * as React from "react"
import type { ProdukRow } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DeleteProdukButton } from "@/components/admin/produk/delete-produk-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProdukGridProps {
  data: ProdukRow[]
  emptyState?: React.ReactNode
}

export function ProdukGrid({ data, emptyState }: ProdukGridProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {data.map((produk) => (
        <Card key={produk.id} className="flex flex-col overflow-hidden h-full border-border/60 shadow-sm hover:shadow-md transition-all bg-card rounded-none p-0 gap-0">
          <div className="relative aspect-video w-full bg-card border-b flex shrink-0 items-center justify-center">
            {produk.gambar_urls[0] ? (
              <Image
                src={produk.gambar_urls[0]}
                alt={produk.nama}
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
                {produk.kategori || "Tanpa Kategori"}
              </Badge>
            </div>
            <div className="absolute top-3 right-3 z-10">
              {produk.stok === "Tersedia" ? (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-full text-[10px] uppercase tracking-wide">Tersedia</Badge>
              ) : (
                <Badge variant="destructive" className="rounded-full text-[10px] uppercase tracking-wide">Habis</Badge>
              )}
            </div>
          </div>
          <CardContent className="flex flex-col flex-1 px-4 py-3 justify-start items-start text-left">
            <h3 className="font-semibold text-[15px] line-clamp-2 mb-1 text-foreground leading-snug">
              {produk.nama}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-foreground">
                Rp {produk.harga.toLocaleString("id-ID")}
                {produk.satuan && (
                  <span className="text-xs font-medium text-muted-foreground"> / {produk.satuan}</span>
                )}
              </span>
              {produk.harga_coret ? (
                <span className="text-xs text-muted-foreground line-through">
                  Rp {produk.harga_coret.toLocaleString("id-ID")}
                </span>
              ) : null}
            </div>
          </CardContent>
          <div className="grid grid-cols-2 border-t bg-card shrink-0">
            <Link
              href={`/admin/produk/edit/${produk.id}`}
              className={buttonVariants({ variant: "ghost", className: "h-11 rounded-none text-muted-foreground hover:text-blue-700 hover:bg-muted font-medium text-xs uppercase tracking-wide" })}
              title="Edit Produk"
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Edit
            </Link>
            <DeleteProdukButton
              id={produk.id}
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
