import type { SidebarNavItem } from "@/components/layout/AppSidebar";
import {
  LayoutDashboard, FileText, Eye, Users,
  BarChart3, Download, Star, Monitor,
  CalendarDays, UserCircle, Building2,
} from "lucide-react";
import { ROLES, type RoleName } from "@/types/constants/roleConstants";

export type { RoleName as UserRole };

const studentNav: SidebarNavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/student/my-submissions", label: "My Submissions", icon: FileText },
];

const coordinatorNav: SidebarNavItem[] = [
  { href: "/coordinator/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/coordinator/review-queue", label: "Review Queue", icon: Eye },
  { href: "/coordinator/guest-list", label: "Guest List", icon: Users },
  { href: "/coordinator/analytics", label: "Analytics", icon: BarChart3 },
];

const managerNav: SidebarNavItem[] = [
  { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/manager/export-center", label: "Export Center", icon: Download },
];

const guestNav: SidebarNavItem[] = [
  { href: "/guest/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/guest/selected-contributions", label: "Selected Contributions", icon: Star },
];

const adminNav: SidebarNavItem[] = [
  { href: "/admin/system-monitoring", label: "System Monitoring", icon: Monitor, end: true },
  { href: "/admin/contribution-windows", label: "Contribution Windows", icon: CalendarDays },
  { href: "/admin/user-management", label: "User Management", icon: Users },
  { href: "/admin/role-management", label: "Role Management", icon: UserCircle },
  { href: "/admin/faculty-management", label: "Faculty Management", icon: Building2 },
];

const navMap: Record<RoleName, SidebarNavItem[]> = {
  [ROLES.STUDENT]: studentNav,
  [ROLES.COORDINATOR]: coordinatorNav,
  [ROLES.MANAGER]: managerNav,
  [ROLES.GUEST]: guestNav,
  [ROLES.ADMIN]: adminNav,
};

export const getNavItemsForRole = (role: RoleName): SidebarNavItem[] => {
  return navMap[role] ?? studentNav;
};
