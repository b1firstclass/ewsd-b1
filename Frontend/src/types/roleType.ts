import type { PageResponse } from "./sharedType";

export interface Role {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
    permissions: PermissionInfo[];
    isFacultyAssignable: boolean;
    isMultipleFaculty?: boolean;
}

export interface RoleCreateRequest {
    name: string;
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

// export interface ActivePermissionListResopnse{

// }

export type RoleSortKey = "id" | "name" | "description";