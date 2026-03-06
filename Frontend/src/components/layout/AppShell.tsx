import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./AppHeader";
import { AppSidebar, type SidebarNavItem } from "./AppSidebar";

interface AppShellProps {
  brandName: string;
  brandDescription?: string;
  navItems: SidebarNavItem[];
  sidebarFooter?: ReactNode;
  headerRight?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}

export const AppShell = ({
  brandName,
  brandDescription,
  navItems,
  sidebarFooter,
  headerRight,
  contentClassName,
  children,
}: AppShellProps) => {
  return (
    <SidebarProvider className="bg-background">
      <AppSidebar
        brandName={brandName}
        brandDescription={brandDescription}
        navItems={navItems}
        footer={sidebarFooter}
      />

      <SidebarInset>
        <AppHeader rightSlot={headerRight} />

        <main className={cn("flex-1 px-4 py-6 sm:px-6 lg:px-8", contentClassName)}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};
