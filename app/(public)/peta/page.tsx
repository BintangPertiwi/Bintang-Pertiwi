import { getFasilitasList } from "@/lib/db/queries";
import type { Metadata } from "next";
import { PetaDynamicLoader } from "@/components/public/peta/peta-dynamic-loader";

export const metadata: Metadata = {
  title: "Peta Interaktif — SIG-Bintang Pertiwi",
  description:
    "Jelajahi peta interaktif Bintang Pertiwi. Temukan lokasi masjid, musholla, posyandu, tempat wisata, dan fasilitas umum lainnya.",
};

export default async function PetaPage() {
  const fasilitasList = await getFasilitasList();

  return <PetaDynamicLoader fasilitas={fasilitasList} />;
}
