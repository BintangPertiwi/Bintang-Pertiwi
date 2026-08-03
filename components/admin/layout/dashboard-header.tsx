import { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>
      {children && <div className="shrink-0 mobile:w-full">{children}</div>}
    </div>
  );
}
