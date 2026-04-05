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
    token: string;
    expiresAt: string;
    refreshToken: string;
    firstTimeLogin: boolean;
}

export interface RefreshTokenRequest{
    refreshToken: string;
}

export interface RefreshTokenResponse{
    token: string;
    refreshToken: string;
    expiresAt: string;
}
