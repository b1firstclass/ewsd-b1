import { api } from "@/lib/api/client";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ApiResponse } from "@/types/sharedType";
import type { User } from "@/types/userType";

export const userApi = {
    getUserProfile: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(ApiRoute.User.profile);
        return response.data.data;
    }
}