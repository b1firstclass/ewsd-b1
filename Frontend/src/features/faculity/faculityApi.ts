import { api } from "@/lib/api/client";
import { getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type { Faculity, FaculityCreateRequest, FaculityListResponse, FaculityUpdateRequest } from "@/types/faculityType";
import type { ApiResponse } from "@/types/sharedType";

export const faculityApi = {
    getList: async (request: pageQueryProps): Promise<FaculityListResponse> => {
        const response = await api.get<ApiResponse<FaculityListResponse>>(
            getPageQuery({
                ...request,
                route: ApiRoute.Faculity.List,
            }),
        );
        console.log("faculty response => ",response.data.data);
        return response.data.data;
    },
    getById: async (id: string): Promise<Faculity> => {
        const response = await api.get<ApiResponse<Faculity>>(ApiRoute.Faculity.GetById(id));
        return response.data.data;
    },
    create: async (request: FaculityCreateRequest): Promise<Faculity> => {
        const response = await api.post<ApiResponse<Faculity>>(ApiRoute.Faculity.Create, request);
        return response.data.data;
    },
    update: async (id: string, request: FaculityUpdateRequest): Promise<Faculity> => {
        const response = await api.put<ApiResponse<Faculity>>(ApiRoute.Faculity.Update(id), request);
        return response.data.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(ApiRoute.Faculity.Delete(id));
    },
}
