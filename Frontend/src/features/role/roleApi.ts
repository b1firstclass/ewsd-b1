import { api } from "@/lib/api/client";
import { getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type { Role, RoleCreateRequest, RoleListResponse, RoleUpdateRequest } from "@/types/roleType";
import type { ApiResponse } from "@/types/sharedType";

export const roleApi = {
    getList: async (request: pageQueryProps): Promise<RoleListResponse> => {
        const response = await api.get<ApiResponse<RoleListResponse>>(
            getPageQuery({
                ...request,
                route: ApiRoute.Role.List,
            }),
        );
        console.log("Role response => ",response.data.data);
        return response.data.data;
    },
    getById: async (id: string): Promise<Role> => {
        const response = await api.get<ApiResponse<Role>>(ApiRoute.Role.GetById(id));
        console.log("Role get by id response =>", response.data.data);
        return response.data.data;
    },
    create: async (request: RoleCreateRequest): Promise<Role> => {
        console.log("Role create request => ",request);
        const response = await api.post<ApiResponse<Role>>(ApiRoute.Role.Create, request);
        return response.data.data;
    },
    update: async (id: string, request: RoleUpdateRequest): Promise<Role> => {
        console.log("Role update request => ",request);
        const response = await api.put<ApiResponse<Role>>(ApiRoute.Role.Update(id), request);
        return response.data.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(ApiRoute.Role.Delete(id));
    },
}