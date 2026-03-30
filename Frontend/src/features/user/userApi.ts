import { api } from "@/lib/api/client";
import { getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ApiResponse } from "@/types/sharedType";
import type { User, UserCreateRequest, UserListResponse, UserUpdateRequest } from "@/types/userType";

export const userApi = {
    getUserProfile: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(ApiRoute.User.profile);
        return response.data.data;
    },
    getList: async (request: pageQueryProps): Promise<UserListResponse> => {
        const response = await api.get<ApiResponse<UserListResponse>>(
            getPageQuery({
                ...request,
                route: ApiRoute.User.List,
            }),
        );
        console.log("User response => ",response.data.data);
        return response.data.data;
    },
    getById: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(ApiRoute.User.GetById(id));
        console.log("User Detail => ",response.data.data);
        return response.data.data;
    },
    create: async (request: UserCreateRequest): Promise<User> => {
        console.log("User Create request => ", request);
        const response = await api.post<ApiResponse<User>>(ApiRoute.User.Create, request);
        return response.data.data;
    },
    update: async (id: string, request: UserUpdateRequest): Promise<User> => {
        const response = await api.put<ApiResponse<User>>(ApiRoute.User.Update(id), request);
        return response.data.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(ApiRoute.User.Delete(id));
    }
}
