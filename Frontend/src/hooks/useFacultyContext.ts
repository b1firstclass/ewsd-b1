import { useMemo } from 'react';
import { getUserDataFromToken } from '@/utils/jwtUtils';
import { storage } from '@/lib/utils';
import { ROLES } from '@/types/constants/roleConstants';

export interface FacultyContext {
  facultyIds: string[];
  facultyNames: string[];
  primaryFaculty: string;
  hasFacultyAccess: boolean;
  isMultiFaculty: boolean;
  canAccessAllFaculties: boolean;
}

export const useFacultyContext = (): FacultyContext => {
  const token = storage.getToken();
  
  const userData = useMemo(() => {
    if (!token) return null;
    return getUserDataFromToken(token);
  }, [token]);

  const facultyContext = useMemo((): FacultyContext => {
    if (!userData) {
      return {
        facultyIds: [],
        facultyNames: [],
        primaryFaculty: 'No Faculty Assigned',
        hasFacultyAccess: false,
        isMultiFaculty: false,
        canAccessAllFaculties: false,
      };
    }

    const facultyIds = userData.facultyIds || [];
    const facultyNames = userData.facultyNames || [];
    const userRole = userData.role;

    // Most roles have single faculty access
    // Only Marketing Manager can view all faculties for analytics/export
    const canAccessAllFaculties = userRole === ROLES.MANAGER;
    const isMultiFaculty = facultyIds.length > 1;

    return {
      facultyIds,
      facultyNames,
      primaryFaculty: facultyNames[0] || 'No Faculty Assigned',
      hasFacultyAccess: facultyIds.length > 0 || canAccessAllFaculties,
      isMultiFaculty,
      canAccessAllFaculties,
    };
  }, [userData]);

  return facultyContext;
};
