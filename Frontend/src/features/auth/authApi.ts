import { api } from "@/lib/api/client";
import type { LoginCrendential, LoginResponse } from "@/types/authType";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ApiResponse } from "@/types/sharedType";

export const authApi = {
    login: async (credentials: LoginCrendential): Promise<LoginResponse> => {
        
        const response = await api.post<ApiResponse<LoginResponse>>(ApiRoute.Auth.Login, credentials);
        return response.data.data;
    },
    logout: async () => {
        
    }
}