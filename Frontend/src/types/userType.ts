import type { Faculity } from "./faculityType";
import type { Role } from "./roleType";
import type { PageResponse } from "./sharedType";

export interface User {
    id: string;
    loginId: string;
    email: string;
    fullName: string;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
    faculties: Faculity[];
    role: Role;
}

export interface UserCreateRequest{
    loginId: string;
    password: string;
    fullName: string;
    email: string;
    facultyIds?: string[];
    roleId: string;
}

export interface UserUpdateRequest {
    loginId: string;
    fullName: string;
    email: string;
    facultyIds?: string[];
    roleId: string;
    isActive: boolean;
}

export interface UserListResponse extends PageResponse {
    items: User[];
}

export type UserSortKey = "id" | "loginId" | "email" | "fullName";
