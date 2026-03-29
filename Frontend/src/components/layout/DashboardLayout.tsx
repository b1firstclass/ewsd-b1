import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "@tanstack/react-router";
import { AppShell } from "./AppShell";
import { getNavItemsForRole } from "@/utils/roleNavigation";
import { ROLES, type RoleName } from "@/types/constants/roleConstants";
import { getUserRoleFromToken } from "@/utils/jwtUtils";
import { SidebarUserCard, HeaderUserButton } from "./UserMenuDropdown";
import React from "react";
import { useRouterState } from "@tanstack/react-router";
import { backendApi } from "@/lib/backendApi";

export const DashboardLayout = () => {
  const { user, accessToken } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const lastLoggedRouteRef = React.useRef<string | null>(null);

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

  return (
    <AppShell
      navItems={navItems}
      sidebarFooter={<SidebarUserCard role={role} />}
      headerRight={<HeaderUserButton role={role} />}
    >
      <Outlet />
    </AppShell>
  );
};
