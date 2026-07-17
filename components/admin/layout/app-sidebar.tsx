"use client";

import {
  BadgeInfo,
  Contact,
  Home,
  Image as ImageIcon,
  LogOut,
  Newspaper,
  PanelTop,
  Settings,
  ShoppingBag,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";

type SidebarItem = {
  title: string;
  icon: React.ElementType;
  href: string;
  superAdminOnly?: boolean;
};

type SidebarGroupDef = {
  section: string;
  items: SidebarItem[];
};

const menuGroups: SidebarGroupDef[] = [
  {
    section: "Main",
    items: [
      { title: "Dashboard", icon: Home, href: "/admin" },
    ],
  },
  {
    section: "Master Data",
    items: [
      { title: "Produk", icon: ShoppingBag, href: "/admin/produk" },
      { title: "Berita", icon: Newspaper, href: "/admin/berita", superAdminOnly: true },
      { title: "Galeri", icon: ImageIcon, href: "/admin/galeri", superAdminOnly: true },
      { title: "Informasi Web", icon: BadgeInfo, href: "/admin/informasi-web", superAdminOnly: true },
      { title: "Kontak Person", icon: Contact, href: "/admin/kontak-person", superAdminOnly: true },
    ],
  },
  {
    section: "Halaman Web",
    items: [
      { title: "Pengaturan Beranda", icon: PanelTop, href: "/admin/pengaturan-beranda", superAdminOnly: true },
      { title: "Pengaturan Berita", icon: PanelTop, href: "/admin/pengaturan-berita", superAdminOnly: true },
      { title: "Pengaturan Galeri", icon: PanelTop, href: "/admin/pengaturan-galeri", superAdminOnly: true },
    ],
  },
  {
    section: "Lainnya",
    items: [
      { title: "Pengguna", icon: Users, href: "/admin/pengguna", superAdminOnly: true },
      { title: "Pengaturan", icon: Settings, href: "/admin/pengaturan" },
    ],
  }
];

export function AppSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => role === "super_admin" || !item.superAdminOnly),
    }))
    .filter((group) => group.items.length > 0);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Berhasil keluar dari dashboard");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Gagal keluar dari dashboard");
      console.error("Failed to logout", error);
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin" onClick={() => setOpenMobile(false)} />}>
              <div className="flex aspect-square size-8 items-center justify-center bg-transparent">
                <div className="grid grid-cols-2 gap-0.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-primary/70 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-primary/50 rounded-full col-span-2 mx-auto"></span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-foreground tracking-tight text-lg">BINTANG PERTIWI</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {visibleGroups.map((group, index) => (
          <React.Fragment key={group.section}>
            {index > 0 && <SidebarSeparator className="mx-4" />}
            <SidebarGroup>
              {group.section !== "Main" && <SidebarGroupLabel>{group.section}</SidebarGroupLabel>}
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item.href === "/admin" 
                    ? pathname === "/admin" 
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton isActive={isActive} tooltip={item.title} render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Keluar" onClick={handleLogout} className="text-red-500 hover:bg-red-600 hover:text-white cursor-pointer [&>svg]:text-red-500 hover:[&>svg]:text-white">
              <LogOut className="h-4 w-4 text-red-500! group-hover/menu-button:text-white!" />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
