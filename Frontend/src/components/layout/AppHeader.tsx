import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  showCollapseButton?: boolean;
}

export const AppHeader = ({
  title,
  subtitle,
  rightSlot,
  showCollapseButton = true,
}: AppHeaderProps) => {
  const { isDesktopCollapsed, toggleDesktopCollapsed } = useSidebar();
  const collapseLabel = isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger />
        {showCollapseButton ? (
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:inline-flex"
            onClick={toggleDesktopCollapsed}
            aria-label={collapseLabel}
            title={collapseLabel}
          >
            {isDesktopCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        ) : null}

        {/* <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
          {subtitle ? <p className="hidden text-sm text-muted-foreground sm:block">{subtitle}</p> : null}
        </div> */}

        {rightSlot ? <div className="ml-auto flex items-center gap-2">{rightSlot}</div> : null}
      </div>
    </header>
  );
};
