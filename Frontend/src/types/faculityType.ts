import type { PageResponse } from "./sharedType";

export interface Faculity {
    id: string;
    name: string;
    isActive: boolean;
    createdDate: string;
}

export interface FaculityCreateRequest {
    name: string;
}

export interface FaculityUpdateRequest extends FaculityCreateRequest {
    isActive: boolean | true;
}

export interface FaculityListResponse extends PageResponse {
    items: Faculity[];
}

export type FaculitySortKey = "id" | "name";
export type SortDirection = "asc" | "desc";
