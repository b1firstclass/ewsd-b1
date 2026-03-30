// JWT decoding utilities
export const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token structure');
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

import { ROLES, type RoleName } from "@/types/constants/roleConstants";

/** Extract role from JWT claim and return the DB role name (PascalCase). */
export const getUserRoleFromToken = (token: string): RoleName => {
  const payload = decodeJWT(token);
  if (!payload) return ROLES.STUDENT;

  const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string;
  if (!role) {
    console.warn('No role found in JWT token, defaulting to Student');
    return ROLES.STUDENT;
  }

  // Validate it's one of our known roles
  const known = Object.values(ROLES) as string[];
  if (known.includes(role)) return role as RoleName;

  console.warn('Unknown role in JWT token:', role, 'defaulting to Student');
  return ROLES.STUDENT;
};

export const getUserDataFromToken = (token: string) => {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    loginId: payload.unique_name,
    email: payload.email,
    role: getUserRoleFromToken(token),
    facultyIds: payload['cms:faculty_ids'] || [],
    facultyNames: payload['cms:faculty_names'] || [],
    roleIds: payload['cms:role_ids'],
    permissions: payload['cms:permissions'] || [],
  };
};

export const getRoleBasedRedirect = (token: string): string => {
  if (!token) return '/login';
  const payload = decodeJWT(token);
  if (!payload) return '/login';
  const role = getUserRoleFromToken(token);
  return getDashboardPath(role);
};

const getDashboardPath = (role: RoleName): string => {
  switch (role) {
    case ROLES.ADMIN:       return '/admin/system-monitoring';
    case ROLES.MANAGER:     return '/manager/dashboard';
    case ROLES.COORDINATOR: return '/coordinator/dashboard';
    case ROLES.GUEST:       return '/guest/dashboard';
    case ROLES.STUDENT:     return '/student/dashboard';
    default:                return '/student/dashboard';
  }
};
