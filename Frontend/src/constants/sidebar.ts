import { cva } from "class-variance-authority";

// Sidebar constants for responsive design and fast refresh optimization

export const SIDEBAR_WIDTH = "15rem";
export const SIDEBAR_WIDTH_ICON = "5rem";
export const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";
export const MOBILE_BREAKPOINT = 768;   // md
export const DESKTOP_BREAKPOINT = 1024; // lg

export type ViewportTier = "mobile" | "tablet" | "desktop";

// Logo sizes for responsive design - optimized for new shield logo
export const LOGO_SIZES = {
  mobile: { width: 120, height: 120 },
  tablet: { width: 120, height: 120 },
  desktop: { width: 120, height: 120 },
  desktopCollapsed: { width: 80, height: 80 },
} as const;

// Sidebar menu button variants for fast refresh
export const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      isActive: {
        true: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
        false: "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent-foreground",
      },
      size: {
        default: "h-10",
        sm: "h-9 text-xs",
        lg: "h-11 text-base",
      },
    },
    defaultVariants: {
      isActive: false,
      size: "default",
    },
  },
);
