import { clsx, type ClassValue } from "clsx"
import type { AxiosError, AxiosResponse } from "axios"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

type AuthStorageMode = "local" | "session";

const getStorageByMode = (mode: AuthStorageMode) =>
  mode === "session" ? sessionStorage : localStorage;

const getActiveAuthStorage = () => {
  if (sessionStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
    return sessionStorage;
  }

  return localStorage;
};

export const storage = {
  setToken: (token: string, mode?: AuthStorageMode) => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    getStorageByMode(mode ?? (getActiveAuthStorage() === sessionStorage ? "session" : "local")).setItem(ACCESS_TOKEN_KEY, token);
  },
  getToken: (): string | null => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  removeToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  setRefreshToken: (refreshToken: string, mode?: AuthStorageMode) => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    getStorageByMode(mode ?? (getActiveAuthStorage() === sessionStorage ? "session" : "local")).setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  getRefreshToken: (): string | null => {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  removeRefreshToken: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    // Keep legacy cleanup for older sessions that stored user snapshots.
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};

export interface pageQueryProps {
  route: string;
  pageNumber: number;
  pageSize: number;
  searchKeyword?: string;
  isActive?: boolean;
}

export const getPageQuery = (pageQuery: pageQueryProps) => {
  const params = new URLSearchParams();
  params.set("PageNumber", String(pageQuery.pageNumber));
  params.set("PageSize", String(pageQuery.pageSize));

  const trimmedKeyword = pageQuery.searchKeyword?.trim();
  if (trimmedKeyword) {
    params.set("SearchKeyword", trimmedKeyword);
  }

  if (typeof pageQuery.isActive === "boolean") {
    params.set("IsActive", String(pageQuery.isActive));
  }

  return `${pageQuery.route}?${params.toString()}`;
}

interface ApiErrorResponse {
  message?: string | null;
  errors?: Record<string, string[]> | null;
}

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;
  const responseData = axiosError?.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  const firstFieldError = responseData?.errors
    ? Object.values(responseData.errors).find((messages) => messages?.length)?.[0]
    : undefined;

  return firstFieldError || fallback;
}

export const getFieldError = (error: unknown, fieldName: string) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const errors = axiosError?.response?.data?.errors;
  if (!errors) {
    return undefined;
  }

  const target = fieldName.toLowerCase();
  const matchedKey = Object.keys(errors).find((key) => key.toLowerCase() === target);
  if (!matchedKey) {
    return undefined;
  }

  return errors[matchedKey]?.[0];
}

export const downloadBlobResponse = (response: AxiosResponse<Blob>, fallbackFileName = "download") => {
  const blob = response.data;

  let fileName = fallbackFileName;

  const disposition = response.headers["content-disposition"];

  if (disposition) {
    const match = disposition.match(/filename="?(.+?)"?$/);
    if (match) fileName = match[1];
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};
