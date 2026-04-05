import { api } from "@/lib/api/client";
import { getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type { CategoryInfo, CategoryListResponse } from "@/types/categoryType";
import type { ApiResponse } from "@/types/sharedType";

export const categoryApi = {
    getList: async (request: pageQueryProps): Promise<CategoryListResponse> => {
        const url = getPageQuery({ ...request, route: ApiRoute.Category.List });
        const response = await api.get<ApiResponse<CategoryListResponse>>(url);
        return response.data.data;
    },

    getActiveList: async (): Promise<CategoryInfo[]> => {
        const response = await api.get<ApiResponse<CategoryInfo[]>>(ApiRoute.Category.getActiveList);
        return response.data.data;
    },

    getById: async (id: string): Promise<CategoryInfo> => {
        const response = await api.get<ApiResponse<CategoryInfo>>(ApiRoute.Category.GetById(id));
        return response.data.data;
    },
};
