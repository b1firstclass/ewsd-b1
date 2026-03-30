import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { PageUrl } from "@/types/constantPageUrl";
import { Building2, CalendarDays, LayoutDashboard, LogOut, UserCircle, Users } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppShell } from "./AppShell";
import type { SidebarNavItem } from "./AppSidebar";

const navItems: SidebarNavItem[] = [
  {
    href: PageUrl.Home,
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    href: PageUrl.Role,
    label: "Role",
    icon: UserCircle
  },
  {
    href: PageUrl.User,
    label: "User",
    icon: Users,
  },
  {
    href: PageUrl.Faculity,
    label: "Faculty",
    icon: Building2,
  },
    {
    href: PageUrl.ContributionWindow,
    label: "Contribution Window",
    icon: CalendarDays,
  },
];

export const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.fullName || user?.loginId || "Guest";
  const roleName = user?.role.name;

  const handleLogout = () => {
    logout();
    navigate(PageUrl.Login, { replace: true });
  };

  return (
    <AppShell
      brandName="EchoPress"
      navItems={navItems}
      sidebarFooter={
        <div className="space-y-1">
          <p className="text-xs text-sidebar-foreground/70">Signed in as</p>
          <p className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</p>
        </div>
      }
      headerRight={
        <>
          {roleName ? (
            <Badge variant="secondary" className="hidden rounded-full sm:inline-flex">
              {roleName}
            </Badge>
          ) : null}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-full"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out from this account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Sign out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <Outlet />
    </AppShell>
  );
};
