"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sortParam = searchParams.get("sort")
  const dirParam = searchParams.get("dir")

  const [sorting, setSorting] = React.useState<SortingState>(
    sortParam ? [{ id: sortParam, desc: dirParam === "desc" }] : []
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (sorting.length > 0) {
      params.set("sort", sorting[0].id)
      params.set("dir", sorting[0].desc ? "desc" : "asc")
    } else {
      params.delete("sort")
      params.delete("dir")
    }
    
    const newQueryString = params.toString()
    if (newQueryString !== searchParams.toString()) {
      router.push(`${pathname}?${newQueryString}`, { scroll: false })
    }
  }, [sorting, pathname, router, searchParams])

  const memoizedData = React.useMemo(() => data, [data])
  const memoizedColumns = React.useMemo(() => columns, [columns])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="flex flex-col w-full bg-card">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-2">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
