import type { PaginatedResult, ListingQueryParams } from "@/types";

export type { ListingQueryParams };

export const DEFAULT_PAGE_LIMITS = {
  berita: 10,
  galeri: 12,
  produk: 12,
  pengguna: 10,
  dokumen: 12,
} as const;

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

export function paginateItems<T>(items: T[], page: number, limit: number): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = clampPage(page, totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);

  return {
    items: items.slice(startIndex, endIndex),
    totalItems,
    totalPages,
    page: currentPage,
    limit,
    startIndex,
    endIndex,
  };
}

export function buildListingQueryParams(
  currentParams: ListingQueryParams,
  updates: Partial<ListingQueryParams>
): ListingQueryParams {
  return {
    q: updates.q ?? currentParams.q,
    filter: updates.filter ?? currentParams.filter,
    status: "status" in updates ? updates.status : currentParams.status,
    page: updates.page ?? currentParams.page,
    limit: updates.limit ?? currentParams.limit,
    view: "view" in updates ? updates.view : currentParams.view,
    month: "month" in updates ? updates.month : currentParams.month,
    year: "year" in updates ? updates.year : currentParams.year,
    product: "product" in updates ? updates.product : currentParams.product,
  };
}

export function createListingSearchParams(params: ListingQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.filter && params.filter !== "all") searchParams.set("filter", params.filter);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.month && params.month !== "all") searchParams.set("month", params.month);
  if (params.year && params.year !== "all") searchParams.set("year", params.year);
  if (params.product && params.product !== "all") searchParams.set("product", params.product);
  if (params.page > 1) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.view) searchParams.set("view", params.view);

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

