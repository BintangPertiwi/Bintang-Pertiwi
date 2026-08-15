import { db } from "../index";
import * as schema from "../schema";



export async function exportData(tablesToExport: string[]) {
  const data: Record<string, Record<string, unknown>[]> = {};
  const tableCounts: Record<string, number> = {};

  for (const tableName of tablesToExport) {
    let result: Record<string, unknown>[] = [];
    switch (tableName) {
      case "admin_auth":
        result = await db.select().from(schema.adminAuth);
        break;
      case "nota_settings":
        result = await db.select().from(schema.notaSettings);
        break;
      case "berita_dusun":
        result = await db.select().from(schema.beritaDusun);
        break;
      case "galeri_dusun":
        result = await db.select().from(schema.galeriDusun);
        break;
      case "dokumen":
        result = await db.select().from(schema.dokumen);
        break;
      case "produk_umkm":
        result = await db.select().from(schema.produkUmkm);
        break;
      case "jurnal_penjualan":
        result = await db.select().from(schema.jurnalPenjualan);
        break;
      case "jurnal_items":
        result = await db.select().from(schema.jurnalItems);
        break;
      case "perangkat_dusun":
        result = await db.select().from(schema.perangkatDusun);
        break;
      case "global_config":
        result = await db.select().from(schema.globalConfig);
        break;
    }
    data[tableName] = result;
    tableCounts[tableName] = result.length;
  }

  return {
    meta: {
      version: "1.0",
      app: "bintang-pertiwi",
      exported_at: new Date().toISOString(),
      table_counts: tableCounts,
    },
    data,
  };
}

export interface BackupData {
  meta: {
    app: string;
    version: string;
    exported_at: string;
    table_counts: Record<string, number>;
  };
  data: Record<string, Record<string, unknown>[]>;
}

export async function importData(parsedData: unknown) {
  const payload = parsedData as BackupData;
  if (!payload || !payload.meta || payload.meta.app !== "bintang-pertiwi" || !payload.data) {
    throw new Error("Format file backup tidak valid.");
  }

  const { data } = payload;
  const importSummary: Record<string, number> = {};

  // Urutan import penting untuk menjaga integritas Foreign Key
  const importOrder = [
    { name: "admin_auth", schema: schema.adminAuth, pk: schema.adminAuth.id },
    { name: "global_config", schema: schema.globalConfig, pk: schema.globalConfig.key },
    { name: "perangkat_dusun", schema: schema.perangkatDusun, pk: schema.perangkatDusun.id },
    { name: "dokumen", schema: schema.dokumen, pk: schema.dokumen.id },
    { name: "galeri_dusun", schema: schema.galeriDusun, pk: schema.galeriDusun.id },
    { name: "produk_umkm", schema: schema.produkUmkm, pk: schema.produkUmkm.id },
    { name: "berita_dusun", schema: schema.beritaDusun, pk: schema.beritaDusun.id },
    { name: "jurnal_penjualan", schema: schema.jurnalPenjualan, pk: schema.jurnalPenjualan.id },
    { name: "jurnal_items", schema: schema.jurnalItems, pk: schema.jurnalItems.id },
    { name: "nota_settings", schema: schema.notaSettings, pk: schema.notaSettings.id },
  ];

  await db.transaction(async (tx) => {
    for (const table of importOrder) {
      const tableData = data[table.name];
      if (tableData && Array.isArray(tableData) && tableData.length > 0) {
        
        // SQLite doesn't support bulk upsert with different values nicely using onConflictDoUpdate for multiple dynamic columns in drizzle easily without specific mapping.
        // For simplicity and safety, we iterate and upsert one by one.
        for (const row of tableData) {
          const setObj: Record<string, unknown> = {};
          for (const key of Object.keys(row)) {
            setObj[key] = row[key];
          }

          await tx.insert(table.schema)
            .values(row)
            .onConflictDoUpdate({
              target: table.pk,
              set: setObj,
            });
        }
        importSummary[table.name] = tableData.length;
      } else {
        importSummary[table.name] = 0;
      }
    }
  });

  return importSummary;
}
