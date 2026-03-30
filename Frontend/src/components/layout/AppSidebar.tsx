import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface AppSidebarProps {
  navItems: SidebarNavItem[];
  footer?: ReactNode;
}

export const AppSidebar = ({ navItems, footer }: AppSidebarProps) => {
  const { setOpenMobile, isCollapsed, viewportTier } = useSidebar();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isMobile = viewportTier === "mobile";
  const showLabels = isMobile || !isCollapsed;

  return (
    <Sidebar>
      <SidebarHeader />

      <SidebarContent>
        <SidebarGroup>
          {showLabels && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.end
                  ? currentPath === item.href
                  : currentPath.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => { if (isMobile) setOpenMobile(false); }}
                      title={item.label}
                      aria-label={item.label}
                      className={cn(
                        sidebarMenuButtonVariants({ isActive }),
                        !showLabels && "justify-center px-0",
                      )}
                    >
                      <Icon />
                      {showLabels && <span className="truncate">{item.label}</span>}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — always visible, passes isCollapsed to child */}
      {footer && <SidebarFooter>{footer}</SidebarFooter>}
    </Sidebar>
  );
};
