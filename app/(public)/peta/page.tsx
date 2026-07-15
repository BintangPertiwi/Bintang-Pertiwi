import { getFasilitasList } from "@/lib/google-sheets";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PetaDynamicLoader } from "@/components/public/peta/peta-dynamic-loader";

export const metadata: Metadata = {
  title: "Peta Interaktif — Bintang Pertiwi",
  description:
    "Jelajahi peta interaktif Bintang Pertiwi. Temukan lokasi masjid, musholla, posyandu, tempat wisata, dan fasilitas umum lainnya.",
};

export default async function PetaPage() {
  await connection();
  const fasilitasList = await getFasilitasList();

  return <PetaDynamicLoader fasilitas={fasilitasList} />;
}
