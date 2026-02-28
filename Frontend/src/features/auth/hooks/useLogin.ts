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
        mutationFn: (credentials: LoginCrendential) => authApi.login(credentials),
        onSuccess: (data) => {
            login(null, data.token, data.refreshToken);
            navigate(PageUrl.Home);
        },
    });
}