import { AppSidebar } from "@/components/admin/layout/app-sidebar";
import { BreadcrumbProvider } from "@/components/admin/layout/breadcrumb-context";
import { DynamicBreadcrumb } from "@/components/admin/layout/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Suspense } from "react";

import { UserNav } from "@/components/admin/layout/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/auth";

async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session?.role ?? "super_admin";

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 bg-background sticky top-0 z-50 border-b border-border shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav username={session?.username} />
          </div>
        </header>
        <main className="flex-1 p-4 tablet:p-6 desktop:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <Suspense fallback={null}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </BreadcrumbProvider>
  );
}
