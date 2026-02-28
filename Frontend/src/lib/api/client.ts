import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";


export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log("api base url =>> ", API_BASE_URL);
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
)

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
)
