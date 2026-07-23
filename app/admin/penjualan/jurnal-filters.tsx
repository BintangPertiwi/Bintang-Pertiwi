"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { buildListingQueryParams, createListingSearchParams, type ListingQueryParams } from "@/lib/listing";

interface JurnalFiltersProps {
  currentQuery: ListingQueryParams;
  options: {
    products: string[];
    years: string[];
  };
}

const MONTHS = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export function JurnalFilters({ currentQuery, options }: JurnalFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (updates: Partial<ListingQueryParams>) => {
    const nextQuery = buildListingQueryParams(currentQuery, {
      ...updates,
      page: 1, // reset page on filter
    });
    router.replace(`${pathname}${createListingSearchParams(nextQuery)}`);
  };

  return (
    <>
      <Select
        value={currentQuery.month || "all"}
        onValueChange={(value) => navigate({ month: value === "all" || !value ? undefined : String(value) })}
      >
        <SelectTrigger className="h-14 w-full lg:w-[150px] bg-background shadow-sm border-muted-foreground/20 text-base">
          <span className="flex flex-1 text-left truncate">
            {currentQuery.month && currentQuery.month !== "all" 
              ? MONTHS.find((m) => m.value === currentQuery.month)?.label || "Bulan..." 
              : "Semua Bulan"}
          </span>
        </SelectTrigger>
        <SelectContent align="end" className="max-h-[300px]">
          <SelectItem value="all">Semua Bulan</SelectItem>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentQuery.year || "all"}
        onValueChange={(value) => navigate({ year: value === "all" || !value ? undefined : String(value) })}
      >
        <SelectTrigger className="h-14 w-full lg:w-[130px] bg-background shadow-sm border-muted-foreground/20 text-base">
          <span className="flex flex-1 text-left truncate">
            {currentQuery.year && currentQuery.year !== "all" 
              ? currentQuery.year 
              : "Semua Tahun"}
          </span>
        </SelectTrigger>
        <SelectContent align="end" className="max-h-[300px]">
          <SelectItem value="all">Semua Tahun</SelectItem>
          {options.years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentQuery.product || "all"}
        onValueChange={(value) => navigate({ product: value === "all" || !value ? undefined : String(value) })}
      >
        <SelectTrigger className="h-14 w-full lg:w-[200px] bg-background shadow-sm border-muted-foreground/20 text-base">
          <span className="flex flex-1 text-left truncate">
            {currentQuery.product && currentQuery.product !== "all" 
              ? currentQuery.product 
              : "Semua Produk"}
          </span>
        </SelectTrigger>
        <SelectContent align="end" className="max-h-[300px]">
          <SelectItem value="all">Semua Produk</SelectItem>
          {options.products.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
