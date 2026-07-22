"use client";

import { DeletePenggunaButton } from "@/components/admin/pengguna/delete-pengguna-button";
import { DataTable } from "@/components/admin/common/data-table";
import { DataTableColumnHeader } from "@/components/admin/common/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import type { adminAuth } from "@/lib/db/schema";

type PenggunaRow = typeof adminAuth.$inferSelect;

function RoleBadge({ role }: { role: string }) {
  if (role === "super_admin") {
    return <Badge variant="secondary" className="text-primary border-primary/20 bg-primary/10">Super Admin</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground border-border">Kontributor</Badge>;
}

interface PenggunaTableProps {
  data: PenggunaRow[];
  emptyState?: React.ReactNode;
  currentUserId: number;
}

export function PenggunaTable({ data, emptyState, currentUserId }: PenggunaTableProps) {
  const columns: ColumnDef<PenggunaRow>[] = [
    {
      accessorKey: "nama",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nama Lengkap" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.nama || "-"}
          {row.original.id === currentUserId && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">(Anda)</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Username" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.username}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Peran" />
      ),
      cell: ({ row }) => <RoleBadge role={row.original.role} />
    },
    {
      accessorKey: "wa_number",
      header: "No. WhatsApp",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.wa_number || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const pengguna = row.original;
        const isSelf = pengguna.id === currentUserId;
        
        return (
          <div className="flex items-center justify-end gap-2">
            <DeletePenggunaButton 
              id={pengguna.id} 
              username={pengguna.username} 
              isSelf={isSelf}
              triggerVariant="ghost"
              triggerClassName="h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white"
              showText={false}
            />
          </div>
        );
      },
    },
  ];

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }
  return <DataTable columns={columns} data={data} />;
}
