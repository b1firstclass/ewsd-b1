import type { User } from "./userType";

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCrendential{
    loginId: string;
    password: string;
}

export interface LoginResponse{
    //user: User;
    token: string;
    expiresAt: string;
    refreshToken: string;
}

