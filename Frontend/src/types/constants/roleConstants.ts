// Role constants — 1:1 with database Roles table
export const ROLES = {
  ADMIN: 'Admin',
  COORDINATOR: 'Coordinator',
  MANAGER: 'Manager',
  STUDENT: 'Student',
  GUEST: 'Guest',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

// Display names for UI
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  Admin: 'Administrator',
  Coordinator: 'Coordinator',
  Manager: 'Manager',
  Student: 'Student',
  Guest: 'Guest',
};
