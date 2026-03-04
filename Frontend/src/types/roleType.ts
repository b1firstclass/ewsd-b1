export interface Role{
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
    permissions: PermissionInfo[];
}

export interface PermissionInfo{
    id: string;
    module: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
}