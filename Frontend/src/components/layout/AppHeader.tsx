import { SidebarTrigger, SidebarCollapseToggle } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

interface AppHeaderProps {
  rightSlot?: ReactNode;
}

export const AppHeader = ({ rightSlot }: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4 lg:px-6">
        {/* Mobile hamburger */}
        <SidebarTrigger />
        {/* Desktop/tablet collapse */}
        <SidebarCollapseToggle />

        {rightSlot && (
          <div className="ml-auto flex items-center gap-2">
            {rightSlot}
          </div>
        )}
      </div>
    </header>
  );
};