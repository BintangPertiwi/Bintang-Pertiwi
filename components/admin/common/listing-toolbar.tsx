"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { ListingQueryParams } from "@/lib/listing";
import { buildListingQueryParams, createListingSearchParams } from "@/lib/listing";
import { Filter, LayoutGrid, List as ListIcon, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export interface ListingFilterOption {
  label: string;
  value: string;
}

interface ListingToolbarProps {
  searchPlaceholder: string;
  searchValue: string;
  activeFilter: string;
  filterOptions: ListingFilterOption[];
  activeStatusFilter?: string;
  statusOptions?: ListingFilterOption[];
  currentLimit: number;
  currentPage: number;
  currentView?: "list" | "grid";
  hasExternalFilters?: boolean;
  children?: React.ReactNode;
}

export function ListingToolbar({
  searchPlaceholder,
  searchValue,
  activeFilter,
  filterOptions,
  activeStatusFilter,
  statusOptions,
  currentLimit,
  currentPage,
  currentView = "list",
  hasExternalFilters = false,
  children,
}: ListingToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [draftSearch, setDraftSearch] = useState(searchValue);

  const currentQuery = useMemo<ListingQueryParams>(
    () => ({
      q: searchValue,
      filter: activeFilter,
      status: activeStatusFilter,
      page: currentPage,
      limit: currentLimit,
      view: currentView,
    }),
    [activeFilter, activeStatusFilter, currentLimit, currentPage, searchValue, currentView]
  );

  useEffect(() => {
    const nextSearch = draftSearch.trim();
    if (nextSearch === searchValue.trim()) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextQuery = buildListingQueryParams(currentQuery, {
        q: nextSearch,
        page: 1,
      });
      router.replace(`${pathname}${createListingSearchParams(nextQuery)}`);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [currentQuery, draftSearch, pathname, router, searchValue]);

  const navigate = (updates: Partial<ListingQueryParams>) => {
    const nextQuery = buildListingQueryParams(currentQuery, {
      ...updates,
      page: updates.page ?? 1,
    });
    router.replace(`${pathname}${createListingSearchParams(nextQuery)}`);
  };

  const resetFilters = () => {
    setDraftSearch("");
    router.replace(pathname);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-3 rounded-lg w-full">
      <div className="flex w-full lg:flex-1 items-center gap-2">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-12 h-14 bg-background shadow-sm border-muted-foreground/20 text-base"
          />
          {draftSearch && (
            <button
              type="button"
              onClick={() => {
                setDraftSearch("");
                navigate({ q: "", page: 1 });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              title="Hapus Pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full lg:w-auto items-center gap-2 shrink-0">
        {(searchValue || (activeFilter && activeFilter !== "all") || (activeStatusFilter && activeStatusFilter !== "all") || hasExternalFilters) && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={resetFilters} 
            className="h-14 px-4 shrink-0 w-full lg:w-auto order-last lg:order-0"
            title="Reset semua pencarian & filter"
          >
            <span className="mr-2">Reset Filter</span>
            <X className="h-4 w-4" />
          </Button>
        )}

        {children}

        {filterOptions && filterOptions.length > 0 && (
          <Select 
            value={activeFilter} 
            onValueChange={(value) => {
              if (value !== null) navigate({ filter: value, page: 1 });
            }}
          >
            <SelectTrigger className="h-14 w-full lg:w-[220px] bg-background shadow-sm border-muted-foreground/20 text-base relative overflow-visible">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
                  {activeFilter && activeFilter !== "all" && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                  )}
                </div>
                <span className="flex flex-1 text-left truncate">
                  {filterOptions.find((opt) => opt.value === activeFilter)?.label || "Kategori..."}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent align="end">
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {statusOptions && (
          <Select 
            value={activeStatusFilter || "all"} 
            onValueChange={(value) => {
              if (value !== null) navigate({ status: value, page: 1 });
            }}
          >
            <SelectTrigger className="h-14 w-full lg:w-[180px] bg-background shadow-sm border-muted-foreground/20 text-base relative overflow-visible">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
                  {activeStatusFilter && activeStatusFilter !== "all" && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                  )}
                </div>
                <span className="flex flex-1 text-left truncate">
                  {statusOptions.find((opt) => opt.value === (activeStatusFilter || "all"))?.label || "Status..."}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent align="end">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex w-full lg:w-auto bg-background shadow-sm border border-muted-foreground/20 rounded-md p-1 h-14 items-center justify-center shrink-0">
          <Button
            type="button"
            variant={currentView === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              document.cookie = "admin_view_preference=grid; path=/; max-age=31536000";
              navigate({ view: "grid" });
            }}
            className={`h-full px-3 flex-1 lg:flex-none ${currentView === "grid" ? "bg-muted" : "text-muted-foreground hover:text-foreground"}`}
            title="Tampilan Grid"
          >
            <LayoutGrid className="h-5 w-5 mx-auto" />
          </Button>
          <Button
            type="button"
            variant={currentView === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              document.cookie = "admin_view_preference=list; path=/; max-age=31536000";
              navigate({ view: "list" });
            }}
            className={`h-full px-3 flex-1 lg:flex-none ${currentView === "list" ? "bg-muted" : "text-muted-foreground hover:text-foreground"}`}
            title="Tampilan List"
          >
            <ListIcon className="h-5 w-5 mx-auto" />
          </Button>
        </div>
      </div>
    </div>
  );
}
