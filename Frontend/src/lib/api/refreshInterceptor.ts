import { authApi } from "@/features/auth/authApi";
import { storage } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import { PageUrl } from "@/types/constantPageUrl";
import type { RefreshTokenResponse } from "@/types/authType";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { api } from "./client";

type AuthRefreshListener = {
    onTokensRefreshed?: (token: string, refreshToken: string) => void;
    onUnauthorized?: () => void;
};

const listeners = new Set<AuthRefreshListener>();
const retriedRequests = new WeakSet<object>();

let refreshPromise: Promise<RefreshTokenResponse> | null = null;
let interceptorAttached = false;

export const registerAuthRefreshListener = (listener: AuthRefreshListener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const notifyTokensRefreshed = (token: string, refreshToken: string) => {
    listeners.forEach((listener) => {
        listener.onTokensRefreshed?.(token, refreshToken);
    });
};

const notifyUnauthorized = () => {
    listeners.forEach((listener) => {
        listener.onUnauthorized?.();
    });
};

const getPathFromUrl = (url: string) => {
    try {
        return new URL(url, window.location.origin).pathname;
    } catch {
        return url;
    }
};

const isAuthRoute = (url?: string) => {
    if (!url) {
        return false;
    }

    const path = getPathFromUrl(url);
    return path.endsWith(ApiRoute.Auth.Login) || path.endsWith(ApiRoute.Auth.RefreshToken);
};

const handleUnauthorized = () => {
    storage.clear();
    notifyUnauthorized();

    if (window.location.pathname !== PageUrl.Login) {
        window.location.assign(PageUrl.Login);
    }
};

const getRefreshPromise = (token: string) => {
    if (!refreshPromise) {
        refreshPromise = authApi
            .refreshToken({ refreshToken: token })
            .then((response) => {
                storage.setToken(response.token);
                storage.setRefreshToken(response.refreshToken);
                notifyTokensRefreshed(response.token, response.refreshToken);
                return response;
            })
            .catch((error) => {
                handleUnauthorized();
                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

const canRetryRequest = (request: InternalAxiosRequestConfig) => {
    return !retriedRequests.has(request as object);
};

const markAsRetried = (request: InternalAxiosRequestConfig) => {
    retriedRequests.add(request as object);
};

if (!interceptorAttached) {
    api.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
            const statusCode = error.response?.status;

            if (statusCode !== 401 || !originalRequest) {
                return Promise.reject(error);
            }

            if (isAuthRoute(originalRequest.url)) {
                return Promise.reject(error);
            }

            if (!canRetryRequest(originalRequest)) {
                return Promise.reject(error);
            }

            const storedRefreshToken = storage.getRefreshToken();
            if (!storedRefreshToken) {
                handleUnauthorized();
                return Promise.reject(error);
            }

            try {
                const refreshedTokens = await getRefreshPromise(storedRefreshToken);

                markAsRetried(originalRequest);
                originalRequest.headers = originalRequest.headers ?? {};
                (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${refreshedTokens.token}`;

                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
    );

    interceptorAttached = true;
}

