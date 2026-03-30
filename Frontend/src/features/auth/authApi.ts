import { backendApi } from "@/lib/backendApi";
import type { LoginCrendential, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from "@/types/authType";

export const authApi = {
    login: async (credentials: LoginCrendential): Promise<LoginResponse> => {
        const response = await backendApi.auth.login(credentials);
        return {
            token: response.token,
            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
            refreshToken: response.refreshToken
        };
    },
    logout: async () => {
        await backendApi.auth.logout();
    },
    refreshToken: async (request: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
        const response = await backendApi.auth.refreshToken(request);
        return {
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour expiry
        };
    },
}