export interface ListingQueryParams {
  q: string;
  filter: string;
  status?: string;
  page: number;
  limit: number;
  view?: string;
  sort?: string;
  dir?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  startIndex: number;
  endIndex: number;
}

