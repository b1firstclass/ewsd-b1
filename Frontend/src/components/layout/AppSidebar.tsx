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
  onClose,
}: SidebarBodyProps) => {
  const brandInitials = brandName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <SidebarHeader className="space-y-1">
        <div className="space-y-1 md:flex md:items-center md:justify-center md:space-y-0 lg:block lg:space-y-1">
          <p className="font-display text-lg font-semibold leading-none md:hidden lg:block">{brandName}</p>
          <p className="hidden font-display text-lg font-semibold leading-none md:block lg:hidden">
            {brandInitials}
          </p>
          {brandDescription ? (
            <p className="text-xs text-sidebar-foreground/70 md:hidden lg:block">{brandDescription}</p>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="md:hidden lg:block">Navigation</SidebarGroupLabel>
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
                          "justify-start md:justify-center md:px-0 lg:justify-start lg:px-3",
                        )
                      }
                    >
                      <Icon />
                      <span className="md:hidden lg:inline">{item.label}</span>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {footer ? <SidebarFooter className="md:hidden lg:block">{footer}</SidebarFooter> : null}
    </>
  );
};

export const AppSidebar = ({
  brandName,
  brandDescription,
  navItems,
  footer,
}: AppSidebarProps) => {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className={cn("max-w-[85vw] md:max-w-none")}>
      <SidebarBody
        brandName={brandName}
        brandDescription={brandDescription}
        navItems={navItems}
        footer={footer}
        onClose={() => setOpenMobile(false)}
      />
    </Sidebar>
  );
};
