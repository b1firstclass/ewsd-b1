export const PageUrl = {
  // Auth
  Login: "/",

  // Student
  StudentDashboard: "/student/dashboard",
  StudentSubmissions: "/student/my-submissions",
  StudentSubmissionForm: "/student/submission-form",

  // Coordinator
  CoordinatorDashboard: "/coordinator/dashboard",
  CoordinatorReviewQueue: "/coordinator/review-queue",
  CoordinatorGuestList: "/coordinator/guest-list",
  CoordinatorAnalytics: "/coordinator/analytics",

  // Manager
  ManagerAnalytics: "/manager/analytics",
  ManagerFacultyPerformance: "/manager/faculty-performance",
  ManagerTrends: "/manager/trends",
  ManagerExportCenter: "/manager/export-center",

  // Guest
  GuestDashboard: "/guest/dashboard",
  GuestSelectedContributions: "/guest/selected-contributions",

  // Admin
  AdminSystemMonitoring: "/admin/system-monitoring",
  AdminContributionWindows: "/admin/contribution-windows",
  AdminUserManagement: "/admin/user-management",
  AdminRoleManagement: "/admin/role-management",
  AdminFacultyManagement: "/admin/faculty-management",
} as const;
