import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import { 
  SIDEBAR_WIDTH, 
  SIDEBAR_WIDTH_ICON, 
  SIDEBAR_COLLAPSED_KEY, 
  MOBILE_BREAKPOINT, 
  DESKTOP_BREAKPOINT, 
  type ViewportTier,
  LOGO_SIZES,
  sidebarMenuButtonVariants 
} from "@/constants/sidebar";

interface SidebarContextValue {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  viewportTier: ViewportTier;
  /** Compat alias */
  isDesktopCollapsed: boolean;
  toggleDesktopCollapsed: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpenMobile?: boolean;
}

const getViewportTier = (): ViewportTier => {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < MOBILE_BREAKPOINT) return "mobile";
  if (w < DESKTOP_BREAKPOINT) return "tablet";
  return "desktop";
};

const getStoredCollapsed = (): boolean | null => {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
};

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ className, style, defaultOpenMobile = false, children, ...props }, ref) => {
    const [openMobile, setOpenMobile] = React.useState(defaultOpenMobile);
    const [collapsedPref, setCollapsedPref] = React.useState<boolean | null>(
      () => getStoredCollapsed(),
    );
    const [viewportTier, setViewportTier] = React.useState<ViewportTier>(() => getViewportTier());

    const toggleSidebar = React.useCallback(() => {
      setOpenMobile((prev) => !prev);
    }, []);

    React.useEffect(() => {
      if (typeof window === "undefined") return;

      const handleResize = () => setViewportTier(getViewportTier());
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close mobile drawer when viewport grows
    React.useEffect(() => {
      if (viewportTier !== "mobile") setOpenMobile(false);
    }, [viewportTier]);

    // Auto-collapse on tablet if no explicit pref
    const isCollapsed = collapsedPref ?? (viewportTier === "tablet");

    const toggleCollapsed = React.useCallback(() => {
      setCollapsedPref((prev) => {
        const current = prev ?? (viewportTier === "tablet");
        const next = !current;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
        }
        return next;
      });
    }, [viewportTier]);

    const value = React.useMemo(
      () => ({
        openMobile,
        setOpenMobile,
        toggleSidebar,
        isCollapsed,
        toggleCollapsed,
        viewportTier,
        // Compat aliases
        isDesktopCollapsed: isCollapsed,
        toggleDesktopCollapsed: toggleCollapsed,
      }),
      [openMobile, toggleSidebar, isCollapsed, toggleCollapsed, viewportTier],
    );

    return (
      <SidebarContext.Provider value={value}>
        <div
          ref={ref}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn("group/sidebar-wrapper flex min-h-svh w-full bg-background", className)}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"aside">>(
  ({ className, children, ...props }, ref) => {
    const { openMobile, setOpenMobile, isCollapsed, viewportTier } = useSidebar();
    const isMobile = viewportTier === "mobile";

    return (
      <>
        {/* Mobile overlay */}
        {isMobile && openMobile && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpenMobile(false)}
          />
        )}

        <aside
          ref={ref}
          className={cn(
            // Base
            "flex h-svh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out",
            // Mobile: fixed offcanvas
            isMobile
              ? cn(
                  "fixed inset-y-0 left-0 z-50 w-[min(80vw,18rem)] shadow-xl",
                  openMobile ? "translate-x-0" : "-translate-x-full",
                )
              : cn(
                  // Tablet/Desktop: static
                  "sticky top-0 z-30 shrink-0",
                  isCollapsed
                    ? "w-[var(--sidebar-width-icon)]"
                    : "w-[var(--sidebar-width)]",
                ),
            className,
          )}
          {...props}
        >
          {children}
        </aside>
      </>
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-h-svh min-w-0 flex-1 flex-col", className)} {...props} />
  ),
);
SidebarInset.displayName = "SidebarInset";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    const { isCollapsed, viewportTier } = useSidebar();
    
    // Determine logo size based on viewport and collapse state
    const getLogoSize = () => {
      if (viewportTier === "mobile") return LOGO_SIZES.mobile;
      if (viewportTier === "tablet") return LOGO_SIZES.tablet;
      if (isCollapsed) return LOGO_SIZES.desktopCollapsed;
      return LOGO_SIZES.desktop;
    };

    const logoSize = getLogoSize();

    // Dynamic padding based on logo size to maintain visual balance
    const getPadding = () => {
      if (viewportTier === "mobile") return "py-4";
      if (viewportTier === "tablet") return "py-5";
      if (isCollapsed) return "py-4";
      return "py-6";
    };

    return (
      <div ref={ref} className={cn("border-b border-sidebar-border px-4", getPadding(), className)} {...props}>
        <div className="flex items-center justify-center overflow-hidden">
          <img
            src={logo}
            alt="Echo Press University"
            width={logoSize.width}
            height={logoSize.height}
            className="transition-all duration-200 ease-in-out object-contain flex-shrink-0"
            style={{
              imageRendering: 'auto',
              width: `${logoSize.width}px`,
              height: `${logoSize.height}px`,
            } as React.CSSProperties}
            decoding="async"
            loading="eager"
          />
        </div>
      </div>
    );
  },
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto px-3 py-4", className)} {...props} />
  ),
);
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border-t border-sidebar-border px-4 py-3", className)} {...props} />
  ),
);
SidebarFooter.displayName = "SidebarFooter";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-2", className)} {...props} />,
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/60",
        className,
      )}
      {...props}
    />
  ),
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-1", className)} {...props} />,
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => <ul ref={ref} className={cn("space-y-1", className)} {...props} />,
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("list-none", className)} {...props} />,
);
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ asChild = false, className, isActive, size, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ isActive, size }), className)}
        {...props}
      />
    );
  },
);
SidebarMenuButton.displayName = "SidebarMenuButton";

/** Mobile hamburger trigger — only visible below md */
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 md:hidden", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggleSidebar();
      }}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

/** Desktop/tablet collapse toggle — hidden on mobile */
const SidebarCollapseToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn("hidden h-9 w-9 md:inline-flex", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggleCollapsed();
      }}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar collapse</span>
    </Button>
  );
});
SidebarCollapseToggle.displayName = "SidebarCollapseToggle";

export {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarCollapseToggle,
  sidebarMenuButtonVariants,
};