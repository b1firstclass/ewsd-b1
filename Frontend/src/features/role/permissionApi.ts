import { api } from "@/lib/api/client";
import { ApiRoute } from "@/types/constantApiRoute";
import type { PermissionInfo } from "@/types/roleType";
import type { ApiResponse } from "@/types/sharedType";

export const permissionApi = {
    getActiveList: async (): Promise<PermissionInfo[]> => {
        const response = await api.get<ApiResponse<PermissionInfo[]>>(ApiRoute.Permission.getActiveList);
        return response.data.data;
    }
}