import { File, FileSpreadsheet, FileText, Presentation, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTypeConfig {
  Icon: LucideIcon;
  color: string;
  label: string;
}

function getConfig(tipe: string): FileTypeConfig {
  const t = (tipe || "").toLowerCase();
  if (t === "pdf") return { Icon: FileText, color: "text-red-500", label: "PDF" };
  if (t === "doc" || t === "docx") return { Icon: FileText, color: "text-blue-600", label: "Word" };
  if (t === "xls" || t === "xlsx") return { Icon: FileSpreadsheet, color: "text-emerald-600", label: "Excel" };
  if (t === "ppt" || t === "pptx") return { Icon: Presentation, color: "text-orange-500", label: "PowerPoint" };
  if (t === "txt") return { Icon: FileText, color: "text-slate-500", label: "Teks" };
  return { Icon: File, color: "text-muted-foreground", label: "Dokumen" };
}

export function FileTypeIcon({ tipe, className }: { tipe: string; className?: string }) {
  const { Icon, color } = getConfig(tipe);
  return <Icon className={cn(color, className)} />;
}

export function fileTypeLabel(tipe: string): string {
  return getConfig(tipe).label;
}
