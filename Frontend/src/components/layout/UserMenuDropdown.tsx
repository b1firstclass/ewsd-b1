import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DISPLAY_NAMES, type RoleName } from "@/types/constants/roleConstants";
import { LogOut, Shield, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface UserMenuDropdownProps {
  role: RoleName;
  /** "sidebar" opens upward, "header" opens downward */
  context: "sidebar" | "header";
  children: ReactNode;
}

const formatLastLogin = (dateStr?: string, firstTime?: boolean): string => {
  if (firstTime || !dateStr) return "Welcome! This is your first login.";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown";
  }
};

export const UserMenuDropdown = ({ role, context, children }: UserMenuDropdownProps) => {
  const { user, logout } = useAuth();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const displayName = user?.fullName || user?.loginId || "User";
  const email = user?.email || "";
  const facultyNames = user?.faculties?.map((f) => f.name).join(", ");
  const lastLogin = formatLastLogin(user?.lastLoginDate, user?.firstTimeLogin);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          side={context === "sidebar" ? "top" : "bottom"}
          align={context === "sidebar" ? "start" : "end"}
          className="w-64"
        >
          {/* User identity */}
          <DropdownMenuLabel className="pb-0 font-semibold">
            {displayName}
          </DropdownMenuLabel>
          {email && (
            <p className="px-2 pb-2 text-xs text-muted-foreground">{email}</p>
          )}

          <DropdownMenuSeparator />

          {/* Role */}
          <DropdownMenuItem disabled className="gap-2 text-xs opacity-100">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">{ROLE_DISPLAY_NAMES[role]}</span>
          </DropdownMenuItem>

          {/* Faculty */}
          {facultyNames && (
            <DropdownMenuItem disabled className="gap-2 text-xs opacity-100">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="truncate text-foreground">{facultyNames}</span>
            </DropdownMenuItem>
          )}

          {/* Last login */}
          <DropdownMenuItem disabled className="gap-2 text-xs opacity-100">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{lastLogin}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Sign out */}
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onSelect={() => setSignOutOpen(true)}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sign-out confirmation */}
      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
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
  );
};

/** Initials-based avatar circle */
export const UserAvatar = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
        className,
      )}
    >
      {initials}
    </div>
  );
};

/** Faculty name display for sidebar footer */
export const SidebarFacultyDisplay = () => {
  const { isCollapsed, viewportTier } = useSidebar();
  const isMobile = viewportTier === "mobile";
  const collapsed = !isMobile && isCollapsed;
  const { user } = useAuth();
  
  const facultyNames = user?.faculties?.map((f) => f.name).join(", ");
  
  if (!facultyNames) return null;
  
  return (
    <div className={cn(
      "px-2 py-1.5 text-sidebar-foreground",
      collapsed && "px-0 text-center"
    )}>
      <div className={cn(
        "flex items-center gap-2",
        collapsed && "justify-center"
      )}>
        <Building2 className="h-4 w-4 text-sidebar-foreground/80 shrink-0" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium opacity-80">
              Affiliated Faculty
            </div>
            <div className="text-sm font-semibold truncate">
              {facultyNames}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Header avatar button */
export const HeaderUserButton = ({ role }: { role: RoleName }) => {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.loginId || "User";

  return (
    <UserMenuDropdown role={role} context="header">
      <button
        type="button"
        className="rounded-full transition-opacity hover:opacity-80"
        aria-label="User menu"
      >
        <UserAvatar name={displayName} />
      </button>
    </UserMenuDropdown>
  );
};
