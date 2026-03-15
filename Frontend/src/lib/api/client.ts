import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import axios, { AxiosHeaders } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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
        console.log("api base url =>> ", API_BASE_URL);
        const headers = applyRequestContentType(config);
        const token = localStorage.getItem("access_token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

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

        const errorMessage =
            (error.response?.data as any)?.message ||
            error.message || "An error is occured.";
        error.message = errorMessage;

        return Promise.reject(error);
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
