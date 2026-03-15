import { api } from "@/lib/api/client";
import { getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type {
    ContributionWindowCreateRequest,
    ContributionWindowInfo,
    ContributionWindowListResponse,
    ContributionWindowStatusResponse,
    ContributionWindowUpdateRequest,
} from "@/types/contributionWindowType";
import type { ApiResponse } from "@/types/sharedType";

export const contributionWindowApi = {
    getList: async (request: pageQueryProps): Promise<ContributionWindowListResponse> => {
        const response = await api.get<ApiResponse<ContributionWindowListResponse>>(
            getPageQuery({
                ...request,
                route: ApiRoute.ContributionWindow.List,
            }),
        );
        return response.data.data;
    },
    getById: async (id: string): Promise<ContributionWindowInfo> => {
        const response = await api.get<ApiResponse<ContributionWindowInfo>>(ApiRoute.ContributionWindow.GetById(id));
        return response.data.data;
    },
    create: async (request: ContributionWindowCreateRequest): Promise<ContributionWindowInfo> => {
        const response = await api.post<ApiResponse<ContributionWindowInfo>>(ApiRoute.ContributionWindow.Create, request);
        return response.data.data;
    },
    update: async (id: string, request: ContributionWindowUpdateRequest): Promise<ContributionWindowInfo> => {
        const response = await api.put<ApiResponse<ContributionWindowInfo>>(ApiRoute.ContributionWindow.Update(id), request);
        return response.data.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(ApiRoute.ContributionWindow.Delete(id));
    },
    getStatus: async (): Promise<ContributionWindowStatusResponse> => {
        const response = await api.get<ApiResponse<ContributionWindowStatusResponse>>(ApiRoute.ContributionWindow.getStatus);
        return response.data.data;
    }
};
