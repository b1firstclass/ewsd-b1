import { SidebarTrigger } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export const AppHeader = ({ title, subtitle, rightSlot }: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger />

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
          {subtitle ? <p className="hidden text-sm text-muted-foreground sm:block">{subtitle}</p> : null}
        </div>

        {rightSlot ? <div className="ml-auto flex items-center gap-2">{rightSlot}</div> : null}
      </div>
    </header>
  );
};
