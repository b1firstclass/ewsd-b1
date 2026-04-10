import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import axios, { AxiosHeaders } from "axios";
import { storage } from "../utils";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
    const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL?.trim() || "");

    if (!configuredBaseUrl || typeof window === "undefined") {
        return configuredBaseUrl;
    }

    const isVercelPreviewHost = window.location.hostname.toLowerCase().endsWith(".vercel.app");

    // Route API traffic through the same-origin Vercel rewrite to avoid browser CORS issues.
    if (isVercelPreviewHost) {
        return "/api";
    }

    return configuredBaseUrl;
};

const API_BASE_URL = resolveApiBaseUrl();

const isFormDataPayload = (data: unknown): data is FormData => {
    return typeof FormData !== "undefined" && data instanceof FormData;
};

const applyRequestContentType = (config: InternalAxiosRequestConfig) => {
    const headers = AxiosHeaders.from(config.headers);

    if (isFormDataPayload(config.data)) {
        headers.delete("Content-Type");
    } else if (!headers.getContentType()) {
        headers.setContentType("application/json");
    }

    config.headers = headers;
    return headers;
};

export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const headers = applyRequestContentType(config);
        const token = storage.getToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// API Error Response interface
interface ApiErrorResponse {
    message?: string;
    error?: string;
    errors?: string[];
}

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (!error.response) {
            return Promise.reject(error);
        }

        // if (error.response.status === 401) {
        //     localStorage.removeItem('access_token');
        //     localStorage.removeItem('refresh_token');
        //     localStorage.removeItem('user');

        //     setTimeout(() => {
        //         window.location.href = PageUrl.Login;
        //     }, 0);
        // }

        const responseData = error.response.data as ApiErrorResponse;
        const errorMessage =
            responseData?.message ||
            responseData?.error ||
            responseData?.errors?.[0] ||
            error.message || 
            "An error occurred.";
        
        // Create a new error with the enhanced message
        const enhancedError = new Error(errorMessage) as AxiosError;
        Object.assign(enhancedError, error);
        enhancedError.message = errorMessage;

        return Promise.reject(enhancedError);
    }
);

type FormDataRequestConfig = AxiosRequestConfig<FormData>;
type FormDataRequestMethod = "post" | "put" | "patch";

const requestFormData = <TResponse>(
    method: FormDataRequestMethod,
    url: string,
    data: FormData,
    config?: FormDataRequestConfig,
): Promise<AxiosResponse<TResponse>> => {
    return api.request<TResponse, AxiosResponse<TResponse>, FormData>({
        ...config,
        method,
        url,
        data,
    });
};

export const formDataApi = {
    post: <TResponse>(
        url: string,
        data: FormData,
        config?: FormDataRequestConfig,
    ): Promise<AxiosResponse<TResponse>> => requestFormData("post", url, data, config),
    put: <TResponse>(
        url: string,
        data: FormData,
        config?: FormDataRequestConfig,
    ): Promise<AxiosResponse<TResponse>> => requestFormData("put", url, data, config),
    patch: <TResponse>(
        url: string,
        data: FormData,
        config?: FormDataRequestConfig,
    ): Promise<AxiosResponse<TResponse>> => requestFormData("patch", url, data, config),
};
