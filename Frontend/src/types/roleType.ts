import type { PageResponse } from "./sharedType";
import { ROLES, type RoleName } from "./constants/roleConstants";

export interface Role {
  id: string;
  name: RoleName;
  description?: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
  permissions: PermissionInfo[];
  isFacultyAssignable: boolean;
  isMultipleFaculty?: boolean;
}

export interface RoleCreateRequest {
  name: RoleName;
  description?: string;
  permissionIds?: string[];
}

export interface RoleUpdateRequest extends RoleCreateRequest {
  isActive: boolean | true;
}

export interface RoleListResponse extends PageResponse {
  items: Role[];
}

export interface PermissionInfo {
  id: string;
  module: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
}

export type RoleSortKey = "id" | "name" | "description";

// Role → permission mapping matching DATABASE_SETUP_QUERIES.sql Roles_Permissions
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [ROLES.ADMIN]: [
    'User.Read', 'User.Create', 'User.Update', 'User.Delete',
    'Permission.Read', 'Permission.Create', 'Permission.Update', 'Permission.Delete',
    'Roles.Read', 'Roles.Create', 'Roles.Update', 'Roles.Delete',
    'Faculty.Create', 'Faculty.Read', 'Faculty.Update', 'Faculty.Delete',
    'ContributionWindow.Create', 'ContributionWindow.Read', 'ContributionWindow.Update', 'ContributionWindow.Delete',
    'Contribution.Create', 'Contribution.Read', 'Contribution.Update', 'Contribution.Delete',
    'Comment.Create', 'Comment.Read', 'Comment.Update', 'Comment.Delete',
    'ActivityLog.Create', 'ActivityLog.Read',
  ],
  [ROLES.COORDINATOR]: [
    'User.Read',
    'Faculty.Read',
    'ContributionWindow.Read',
    'Contribution.Create', 'Contribution.Read', 'Contribution.Update', 'Contribution.Delete',
    'Comment.Create', 'Comment.Read', 'Comment.Update', 'Comment.Delete',
  ],
  [ROLES.MANAGER]: [
    'Faculty.Read',
    'ContributionWindow.Read',
    'Contribution.Read',
  ],
  [ROLES.STUDENT]: [
    'ContributionWindow.Read',
    'Contribution.Create', 'Contribution.Read', 'Contribution.Update',
    'Comment.Read',
  ],
  [ROLES.GUEST]: [
    'Contribution.Read',
  ],
};
