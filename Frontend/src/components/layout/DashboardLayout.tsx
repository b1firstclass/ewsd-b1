import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "@tanstack/react-router";
import { AppShell } from "./AppShell";
import { getNavItemsForRole } from "@/utils/roleNavigation";
import { ROLES, type RoleName } from "@/types/constants/roleConstants";
import { getUserRoleFromToken } from "@/utils/jwtUtils";
import { SidebarFacultyDisplay, HeaderUserButton } from "./UserMenuDropdown";
import React from "react";
import { useRouterState } from "@tanstack/react-router";
import { backendApi } from "@/lib/backendApi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Star } from "lucide-react";
import { storage } from "@/lib/utils";

export const DashboardLayout = () => {
  const { user, accessToken } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const lastLoggedRouteRef = React.useRef<string | null>(null);
  const [welcomeModalOpen, setWelcomeModalOpen] = React.useState(false);
  const [firstLoginRole, setFirstLoginRole] = React.useState<string | null>(null);

  const role: RoleName = React.useMemo(() => {
    if (user?.role?.name) return user.role.name as RoleName;
    if (accessToken) {
      try { return getUserRoleFromToken(accessToken); } catch { return ROLES.STUDENT; }
    }
    return ROLES.STUDENT;
  }, [user, accessToken]);

  const navItems = getNavItemsForRole(role);

  React.useEffect(() => {
    // Log each route view once per path change.
    if (!accessToken || !pathname) return;
    if (lastLoggedRouteRef.current === pathname) return;

    lastLoggedRouteRef.current = pathname;
    backendApi.activityLog.create({ route: pathname }).catch((error) => {
      // Non-blocking telemetry; never disrupt navigation/rendering.
      console.error("Failed to log frontend route:", error);
    });
  }, [accessToken, pathname]);

  React.useEffect(() => {
    if (!accessToken) return;

    const pendingWelcomeRole = storage.getFirstLoginWelcome();
    if (!pendingWelcomeRole) return;

    setFirstLoginRole(pendingWelcomeRole);
    setWelcomeModalOpen(true);
    storage.clearFirstLoginWelcome();
  }, [accessToken, pathname]);

  return (
    <>
      <AppShell
        navItems={navItems}
        sidebarFooter={<SidebarFacultyDisplay />}
        headerRight={<HeaderUserButton role={role} />}
      >
        <Outlet />
      </AppShell>

      <Dialog open={welcomeModalOpen} onOpenChange={setWelcomeModalOpen}>
        <DialogContent className="overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-xl">
          <div className="relative rounded-[28px] border border-primary/20 bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fffdf8_42%,#fff_100%)] shadow-2xl">
            <div className="absolute -left-14 top-10 h-36 w-36 rounded-full bg-chart-2/15 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative px-8 py-8 sm:px-10 sm:py-10">
              <div className="mb-6 flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  First Login
                </div>
                <div className="flex gap-2 text-chart-2">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="mt-3 h-3 w-3 fill-current opacity-70" />
                </div>
              </div>

              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
                  Welcome to Echo Press
                </DialogTitle>
                <DialogDescription className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  Your account is ready and this is your first successful login as {firstLoginRole ?? "a user"}.
                  You can now start exploring.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  className="rounded-xl px-6 shadow-lg shadow-primary/20"
                  onClick={() => setWelcomeModalOpen(false)}
                >
                  Start exploring
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
