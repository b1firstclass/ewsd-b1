import type { PageResponse } from "./sharedType";

export interface CategoryInfo {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdDate?: string;
    modifiedDate?: string;
}

export interface CategoryListResponse extends PageResponse {
    items: CategoryInfo[];
}
