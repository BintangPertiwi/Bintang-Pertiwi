"use client";

import type { ProdukRow } from "@/types";
import { ChevronRight, Home, MessageCircle, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProdukDetail({ product, fallbackWa = "" }: { product: ProdukRow; fallbackWa?: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVarian, setSelectedVarian] = useState(product.varian[0] ?? "");

  // Pesanan diarahkan ke WA pemilik produk; fallback ke Kontak Person, lalu nomor pusat.
  const rawWa = product.owner_wa || fallbackWa || "6289501603099";
  const WA_NUMBER = rawWa.replace(/^0/, "62").replace(/\D/g, "");
  const varianLine = selectedVarian ? `\nVarian: ${selectedVarian}` : "";
  const jumlahText = product.satuan ? `${quantity} ${product.satuan}` : `${quantity}`;
  const waMessage = encodeURIComponent(`Halo Bintang Pertiwi, saya tertarik untuk memesan produk:\n\n*${product.nama}*${varianLine}\nJumlah: ${jumlahText}\nSKU: ${product.sku}\n\nApakah stoknya masih tersedia?`);
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-10 pb-4 border-b border-border">
        <Link href="/produk-umkm" className="hover:text-primary transition-colors flex items-center">
          <Home className="w-4 h-4 mr-1.5" />
          Produk UMKM
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
        <span className="text-foreground font-medium truncate">{product.nama}</span>
      </div>

      {/* Product Main Section */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-16">
        
        {/* Left: Images */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-square relative w-full bg-muted rounded-2xl overflow-hidden border border-border">
            <Image 
              src={product.gambar_urls[activeImage]} 
              alt={product.nama}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          
          {/* Thumbnails */}
          {product.gambar_urls.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.gambar_urls.map((url, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <Image src={url} alt={`${product.nama} ${idx+1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-2">
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">
              {product.kategori}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {product.nama}
          </h1>
          
          <div className="flex items-center mb-6">
            {product.stok === "Tersedia" ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center leading-none">
                Tersedia
              </Badge>
            ) : (
              <Badge variant="destructive" className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center leading-none">
                Habis
              </Badge>
            )}
          </div>

          <div className="flex items-end gap-3 mb-6 pb-6 border-b border-border">
            <span className="text-3xl font-bold text-foreground">
              Rp {product.harga.toLocaleString('id-ID')}
              {product.satuan && (
                <span className="text-base font-medium text-muted-foreground"> / {product.satuan}</span>
              )}
            </span>
            {product.harga_coret && (
              <span className="text-lg text-muted-foreground line-through decoration-slate-300 mb-1">
                Rp {product.harga_coret.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            {product.deskripsi_singkat}
          </p>

          {product.varian.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-bold text-foreground mb-3">Varian</h4>
              <div className="flex flex-wrap gap-3">
                {product.varian.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVarian(v)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      v === selectedVarian
                        ? "border-2 border-primary text-primary font-semibold"
                        : "border border-border text-muted-foreground hover:border-border font-medium"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 sm:gap-4 mb-10 w-full">
            {/* Quantity */}
            <div className="flex items-center border border-border rounded-full bg-background h-12 sm:h-14 w-fit p-1 shrink-0">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer shrink-0"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 sm:w-12 text-center font-bold text-foreground">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Order Button (WhatsApp) */}
            <Link 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full text-sm sm:text-base font-bold bg-[#25D366] text-white hover:bg-[#1DA851] transition-all h-12 sm:h-14 px-4 sm:px-8 flex-1 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 shrink-0" />
              <span className="truncate">Pesan via WA</span>
            </Link>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground border-t border-border pt-6">
            <div className="flex"><span className="w-24 font-semibold text-foreground">Tag:</span> <span>{product.tags.join(', ')}</span></div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full mt-16 pt-4 border-t border-border">
        <Tabs defaultValue="description" className="w-full">
          <div className="flex justify-start border-b border-border pb-4">
            <TabsList className="bg-transparent h-auto p-0 space-x-8">
              <TabsTrigger 
                value="description" 
                className="bg-transparent! shadow-none! data-active:text-primary data-active:font-bold rounded-none px-0 py-2 text-base font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors"
              >
                Deskripsi
              </TabsTrigger>
              <TabsTrigger 
                value="additional" 
                className="bg-transparent! shadow-none! data-active:text-primary data-active:font-bold rounded-none px-0 py-2 text-base font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors"
              >
                Informasi Tambahan
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="description" className="w-full text-muted-foreground leading-relaxed text-sm sm:text-lg pt-2 focus-visible:outline-none">
            <p>{product.deskripsi_lengkap}</p>
          </TabsContent>
          
          <TabsContent value="additional" className="w-full pt-2 focus-visible:outline-none">
            <ul className="flex flex-col w-full border-t border-border/60">
              {product.informasi_tambahan.split('\n').map((info, idx) => {
                const [key, val] = info.split(': ');
                if (!val) return <li key={idx} className="text-muted-foreground text-sm sm:text-base py-3 border-b border-border/60">{info}</li>;
                return (
                  <li key={idx} className="flex items-start py-3 sm:py-4 border-b border-border/60 text-sm sm:text-base">
                    <span className="w-1/3 sm:w-1/4 lg:w-48 font-bold text-foreground shrink-0 pr-4">{key}</span>
                    <span className="w-2/3 sm:w-3/4 lg:w-auto text-muted-foreground">{val}</span>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
