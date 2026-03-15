import { api, formDataApi } from "@/lib/api/client";
import { downloadBlobResponse, getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ContributionBulkSelectRequest, ContributionCreateForm, ContributionInfo, ContributionListResonse, ContributionUpdateForm } from "@/types/contributionType";
import { toContributionCreateFormData, toContributionUpdateFormData } from "@/types/formData";
import type { ApiResponse } from "@/types/sharedType";

export const contributionApi = {
    getList: async (request: pageQueryProps): Promise<ContributionListResonse> => {
        const response = await api.get<ApiResponse<ContributionListResonse>>(
            getPageQuery({
                ...request,
                route: ApiRoute.Contribution.List,
            }),
        );
        console.log("contribution response => ", response.data.data);
        return response.data.data;
    },
    getById: async (id: string): Promise<ContributionInfo> => {
        const response = await api.get<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.GetById(id));
        return response.data.data;
    },
    create: async (request: ContributionCreateForm): Promise<ContributionInfo> => {
        const formData = toContributionCreateFormData(request);
        const response = await formDataApi.post<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.Create, formData);
        return response.data.data;
    },
    update: async (id: string, request: ContributionUpdateForm): Promise<ContributionInfo> => {
        const formData = toContributionUpdateFormData(request);
        const response = await formDataApi.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.Update(id), formData);
        return response.data.data;
    },
    getSelectedList: async (status: string, request: pageQueryProps): Promise<ContributionListResonse> => {
        const pageQuery = getPageQuery({ ...request, route: ApiRoute.Contribution.getSelectedList }) + `&Status=${status}`;
        const response = await api.get<ApiResponse<ContributionListResonse>>(pageQuery);
        return response.data.data;
    },
    downloadSelected: async (id: string): Promise<void> => {
        const response = await api.get<Blob>(
            ApiRoute.Contribution.downloadSelected(id),
            { responseType: "blob" }
        );
        downloadBlobResponse(response);
    },
    downloadSelectedList: async (): Promise<void> => {
        const response = await api.get<Blob>(
            ApiRoute.Contribution.downloadSelectedList,
            { responseType: "blob" }
        );
        downloadBlobResponse(response);
    },
    submit: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.submit(id));
        return response.data.data;
    },
    review: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.review(id));
        return response.data.data;
    },
    approve: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.approve(id));
        return response.data.data;
    },
    select: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.select(id));
        return response.data.data;
    },
    selectList: async (request: ContributionBulkSelectRequest): Promise<ContributionInfo[]> => {
        const response = await api.put<ApiResponse<ContributionInfo[]>>(ApiRoute.Contribution.selectList, request);
        return response.data.data;
    },
    reject: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.reject(id));
        return response.data.data;
    },
    requestRevision: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.requestRevision(id));
        return response.data.data;
    }
}