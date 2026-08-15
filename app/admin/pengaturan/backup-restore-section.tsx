"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download, Upload, AlertTriangle, FileJson } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BACKUP_GROUPS } from "@/lib/db/queries/backup";

export function BackupRestoreSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // By default all tables are selected
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    BACKUP_GROUPS.map((g) => g.id)
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) => 
      prev.includes(groupId) 
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGroups.length === BACKUP_GROUPS.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(BACKUP_GROUPS.map((g) => g.id));
    }
  };

  const handleExport = async () => {
    if (selectedGroups.length === 0) {
      toast.error("Pilih minimal satu grup data untuk di-backup.");
      return;
    }

    setIsExporting(true);
    try {
      const tablesToExport = BACKUP_GROUPS
        .filter((g) => selectedGroups.includes(g.id))
        .flatMap((g) => g.tables);

      const tablesQuery = tablesToExport.join(",");
      
      const response = await fetch(`/api/backup/export?tables=${tablesQuery}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error("Gagal mengunduh backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "backup.json";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Backup berhasil diunduh.");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memproses backup.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Format file harus .json");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Parse file to validate before sending
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (!json.meta || json.meta.app !== "bintang-pertiwi") {
        toast.error("File backup tidak dikenali atau dari aplikasi yang salah.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Prompt confirmation
      if (confirm(`Apakah Anda yakin ingin meng-import backup ini? Data dengan ID yang sama akan ditimpa (update).\n\nTanggal Backup: ${new Date(json.meta.exported_at).toLocaleString('id-ID')}`)) {
        handleImport(json);
      } else {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      toast.error("File tidak valid atau rusak.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImport = async (jsonData: unknown) => {
    setIsImporting(true);
    try {
      const response = await fetch("/api/backup/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal meng-import backup");
      }

      toast.success("Data berhasil di-import!");
      // Option to show summary could be done here
      console.log("Import summary:", result.summary);
      
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat meng-import data.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      {/* EXPORT SECTION */}
      <div className="space-y-4 bg-muted/30 p-4 tablet:p-6 rounded-lg border border-border">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="h-5 w-5" /> Export Backup
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pilih data yang ingin Anda unduh. Backup hanya mencakup data di database. File gambar (media Cloudinary) tidak di-download, hanya URL-nya saja yang tersimpan.
          </p>
        </div>
        
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 bg-background p-4 rounded-md border border-border">
          {BACKUP_GROUPS.map((group) => (
            <div key={group.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`group-${group.id}`} 
                checked={selectedGroups.includes(group.id)}
                onCheckedChange={() => handleGroupToggle(group.id)}
              />
              <label 
                htmlFor={`group-${group.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {group.label}
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-col tablet:flex-row gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={handleSelectAll}
            type="button"
          >
            {selectedGroups.length === BACKUP_GROUPS.length ? "Batal Pilih Semua" : "Pilih Semua"}
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedGroups.length === 0}
            className="flex-1"
          >
            {isExporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengekspor...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" /> Download Backup (.json)</>
            )}
          </Button>
        </div>
      </div>

      {/* IMPORT SECTION */}
      <div className="space-y-4 bg-muted/30 p-4 tablet:p-6 rounded-lg border border-border">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" /> Import / Restore
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pilih file backup .json untuk di-import. 
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-md flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
            <strong>Peringatan:</strong> Proses import akan melakukan penggabungan data. Jika data dengan ID yang sama sudah ada, data tersebut akan <strong>ditimpa (di-update)</strong>. Data yang belum ada akan ditambahkan.
          </div>
        </div>

        <div className="pt-2">
          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isImporting}
          />
          <Button 
            variant="outline" 
            className="w-full h-14 border-dashed border-2 bg-background hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            type="button"
          >
            {isImporting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses Import...</>
            ) : (
              <><FileJson className="mr-2 h-5 w-5 text-muted-foreground" /> Pilih File Backup (.json)</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
