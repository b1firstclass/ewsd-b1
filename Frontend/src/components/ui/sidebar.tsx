import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "18rem";
const SIDEBAR_WIDTH_ICON = "4rem";

interface SidebarContextValue {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
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

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ className, style, defaultOpenMobile = false, children, ...props }, ref) => {
    const [openMobile, setOpenMobile] = React.useState(defaultOpenMobile);

    const toggleSidebar = React.useCallback(() => {
      setOpenMobile((prev) => !prev);
    }, []);

    const value = React.useMemo(
      () => ({
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [openMobile, toggleSidebar],
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
          className={cn("group/sidebar-wrapper flex min-h-screen w-full bg-background", className)}
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
    const { openMobile, setOpenMobile } = useSidebar();

    return (
      <>
        {openMobile ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-40 bg-black/45 md:hidden"
            onClick={() => setOpenMobile(false)}
          />
        ) : null}

        <aside
          ref={ref}
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-screen w-[var(--sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-[transform,width] duration-200 md:static md:z-auto md:flex md:min-h-screen md:flex-col md:w-[var(--sidebar-width-icon)] md:translate-x-0 md:shadow-none lg:w-[var(--sidebar-width)]",
            openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0",
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
    <div ref={ref} className={cn("flex min-h-screen min-w-0 flex-1 flex-col", className)} {...props} />
  ),
);
SidebarInset.displayName = "SidebarInset";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border-b border-sidebar-border px-4 py-5", className)} {...props} />
  ),
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
    <div ref={ref} className={cn("border-t border-sidebar-border px-4 py-4", className)} {...props} />
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

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4",
  {
    variants: {
      isActive: {
        true: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
        false:
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "size" | "variant">
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="icon"
      className={cn("h-9 w-9 md:hidden", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggleSidebar();
      }}
      {...props}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

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
  sidebarMenuButtonVariants,
};
