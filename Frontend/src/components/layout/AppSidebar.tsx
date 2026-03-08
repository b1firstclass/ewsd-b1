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
import { NavLink } from "react-router-dom";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface SidebarBodyProps {
  brandName: string;
  brandDescription?: string;
  navItems: SidebarNavItem[];
  footer?: ReactNode;
  isDesktopCollapsed: boolean;
  onClose: () => void;
}

interface AppSidebarProps {
  brandName: string;
  brandDescription?: string;
  navItems: SidebarNavItem[];
  footer?: ReactNode;
}

const SidebarBody = ({
  brandName,
  brandDescription,
  navItems,
  footer,
  isDesktopCollapsed,
  onClose,
}: SidebarBodyProps) => {
  const normalizedBrandName = brandName.trim();
  const computedInitials = normalizedBrandName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const brandInitials = computedInitials || "AP";

  return (
    <>
      <SidebarHeader className="space-y-1">
        <div
          className={cn(
            "flex-1 space-y-1",
            isDesktopCollapsed && "md:flex md:items-center md:justify-center md:space-y-0",
          )}
        >
          <p className={cn("font-display text-lg font-semibold leading-none", isDesktopCollapsed && "md:hidden")}>
            {brandName}
          </p>
          <p className={cn("hidden font-display text-lg font-semibold leading-none", isDesktopCollapsed && "md:block")}>
            {brandInitials}
          </p>
          {brandDescription ? (
              <p className={cn("text-xs text-sidebar-foreground/70", isDesktopCollapsed && "md:hidden")}>
                {brandDescription}
              </p>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isDesktopCollapsed && "md:hidden")}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.end}
                      onClick={onClose}
                      title={item.label}
                      aria-label={item.label}
                      className={({ isActive }) =>
                        cn(
                          sidebarMenuButtonVariants({ isActive }),
                          isDesktopCollapsed ? "md:justify-center md:px-0" : "md:justify-start md:px-3",
                        )
                      }
                    >
                      <Icon />
                      <span className={cn(isDesktopCollapsed && "md:hidden")}>{item.label}</span>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {footer ? <SidebarFooter className={cn(isDesktopCollapsed && "md:hidden")}>{footer}</SidebarFooter> : null}
    </>
  );
};

export const AppSidebar = ({
  brandName,
  brandDescription,
  navItems,
  footer,
}: AppSidebarProps) => {
  const { setOpenMobile, isDesktopCollapsed } = useSidebar();

  return (
    <Sidebar className={cn("max-w-[85vw] md:max-w-none")}>
      <SidebarBody
        brandName={brandName}
        brandDescription={brandDescription}
        navItems={navItems}
        footer={footer}
        isDesktopCollapsed={isDesktopCollapsed}
        onClose={() => setOpenMobile(false)}
      />
    </Sidebar>
  );
};
