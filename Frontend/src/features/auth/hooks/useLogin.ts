import { useAuth } from "@/contexts/AuthContext"
import type { LoginCrendential } from "@/types/authType";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../authApi";

type LoginMutationInput = {
    credentials: LoginCrendential;
    rememberMe: boolean;
};

export const useLogin = () => {
    const { login } = useAuth();

    return useMutation({
        mutationFn: async ({ credentials, rememberMe }: LoginMutationInput) => {
            const data = await authApi.login(credentials);
            // Store tokens but don't block on profile fetch
            login(data.token, data.refreshToken, rememberMe).catch(() => {
                // Profile fetch failed - tokens are already stored, navigation will proceed
                console.warn("Profile fetch failed after login, continuing with redirect");
            });
            return data;
        },
    });
}
