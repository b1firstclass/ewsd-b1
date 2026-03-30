import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { storage } from "@/lib/utils";
import { getUserRoleFromToken, getRoleBasedRedirect } from "@/utils/jwtUtils";
import { ROLES } from "@/types/constants/roleConstants";

// Layout
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Auth
import { LoginPage } from "@/features/auth/components/LoginPage";

// Student pages
import {
  StudentDashboardPage,
  StudentSubmissionsPage,
} from "@/features/student/pages/StudentDashboardPage";

// Coordinator pages
import {
  CoordinatorDashboardPage,
  ReviewQueuePage,
} from "@/features/coordinator/pages/CoordinatorPages";
import { GuestListPage } from "@/features/coordinator/pages/GuestListPage";
import { CoordinatorAnalyticsPage } from "@/features/coordinator/pages/CoordinatorAnalyticsPage";

// Manager pages
import {
  ManagerDashboardPage,
  ManagerExportCenterPage,
} from "@/features/manager/pages/ManagerPages";

// Guest pages
import {
  GuestDashboardPage,
  SelectedContributionsPage,
} from "@/features/guest/pages/GuestPages";

// Admin pages
import {
  SystemMonitoringPage,
} from "@/features/admin/pages/AdminPages";
import { ContributionWindowPage } from "@/features/contributionWindow/components/ContributionWindowPage";
import { UserListPage } from "@/features/user/component/UserListPage";
import { RolePage } from "@/features/role/components/RolePage";
import { FaculityPage } from "@/features/faculity/components/FaculityPage";

// ── Authentication & Authorization Helpers ──────────────────────────────────────
const requireAuth = () => {
  const token = storage.getToken();
  if (!token) throw redirect({ to: "/" });
  return { token };
};

const requireRole = (...roles: string[]) => {
  return () => {
    const { token } = requireAuth();
    const userRole = getUserRoleFromToken(token);
    if (!roles.includes(userRole)) {
      // Redirect to their own dashboard
      throw redirect({ to: getRoleBasedRedirect(token) });
    }
    return { token, role: userRole };
  };
};

// ── Routes ───────────────────────────────────────────────
const rootRoute = createRootRoute({ component: Outlet });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

// ── Student layout ───────────────────────────────────────
const studentLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "student-layout",
  component: DashboardLayout,
  beforeLoad: requireRole(ROLES.STUDENT),
});

const studentDashboard = createRoute({
  getParentRoute: () => studentLayout,
  path: "/student/dashboard",
  component: StudentDashboardPage,
});

const studentSubmissions = createRoute({
  getParentRoute: () => studentLayout,
  path: "/student/my-submissions",
  component: StudentSubmissionsPage,
});


// ── Coordinator layout ───────────────────────────────────
const coordinatorLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "coordinator-layout",
  component: DashboardLayout,
  beforeLoad: requireRole(ROLES.COORDINATOR),
});

const coordinatorDashboard = createRoute({
  getParentRoute: () => coordinatorLayout,
  path: "/coordinator/dashboard",
  component: CoordinatorDashboardPage,
});

const coordinatorReviewQueue = createRoute({
  getParentRoute: () => coordinatorLayout,
  path: "/coordinator/review-queue",
  component: ReviewQueuePage,
});

const coordinatorGuestList = createRoute({
  getParentRoute: () => coordinatorLayout,
  path: "/coordinator/guest-list",
  component: GuestListPage,
});

const coordinatorAnalytics = createRoute({
  getParentRoute: () => coordinatorLayout,
  path: "/coordinator/analytics",
  component: CoordinatorAnalyticsPage,
});

// ── Manager layout ───────────────────────────────────────
const managerLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "manager-layout",
  component: DashboardLayout,
  beforeLoad: requireRole(ROLES.MANAGER),
});

const managerDashboard = createRoute({
  getParentRoute: () => managerLayout,
  path: "/manager/dashboard",
  component: ManagerDashboardPage,
});

const managerExportCenter = createRoute({
  getParentRoute: () => managerLayout,
  path: "/manager/export-center",
  component: ManagerExportCenterPage,
});

// ── Guest layout ─────────────────────────────────────────
const guestLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "guest-layout",
  component: DashboardLayout,
  beforeLoad: requireRole(ROLES.GUEST),
});

const guestDashboard = createRoute({
  getParentRoute: () => guestLayout,
  path: "/guest/dashboard",
  component: GuestDashboardPage,
});

const guestSelectedContributions = createRoute({
  getParentRoute: () => guestLayout,
  path: "/guest/selected-contributions",
  component: SelectedContributionsPage,
});

// ── Admin layout ─────────────────────────────────────────
const adminLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: DashboardLayout,
  beforeLoad: requireRole(ROLES.ADMIN),
});

const adminSystemMonitoring = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/system-monitoring",
  component: SystemMonitoringPage,
});

const adminContributionWindows = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/contribution-windows",
  component: ContributionWindowPage,
});

const adminUserManagement = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/user-management",
  component: UserListPage,
});

const adminRoleManagement = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/role-management",
  component: RolePage,
});

const adminFacultyManagement = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/faculty-management",
  component: FaculityPage,
});

// ── Route tree ───────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  loginRoute,
  studentLayout.addChildren([
    studentDashboard,
    studentSubmissions,
  ]),
  coordinatorLayout.addChildren([
    coordinatorDashboard,
    coordinatorReviewQueue,
    coordinatorGuestList,
    coordinatorAnalytics,
  ]),
  managerLayout.addChildren([
    managerDashboard,
    managerExportCenter,
  ]),
  guestLayout.addChildren([
    guestDashboard,
    guestSelectedContributions,
  ]),
  adminLayout.addChildren([
    adminSystemMonitoring,
    adminContributionWindows,
    adminUserManagement,
    adminRoleManagement,
    adminFacultyManagement,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});
