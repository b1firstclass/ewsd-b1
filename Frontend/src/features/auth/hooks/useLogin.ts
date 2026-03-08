import { useAuth } from "@/contexts/AuthContext"
import type { LoginCrendential } from "@/types/authType";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../authApi";
import { PageUrl } from "@/types/constantPageUrl";

export const useLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (credentials: LoginCrendential) => {
            const data = await authApi.login(credentials);
            await login(data.token, data.refreshToken);
            return data;
        },
        onSuccess: () => {
            navigate(PageUrl.Home);
        },
    });
}
