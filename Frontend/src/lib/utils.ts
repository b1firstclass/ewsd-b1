import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const storage = {
  setToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  removeToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  setRefreshToken: (refreshToken: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  removeRefreshToken: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Keep legacy cleanup for older sessions that stored user snapshots.
    localStorage.removeItem(USER_KEY);
  },
};

export interface pageQueryProps {
  route: string;
  pageNumber: number;
  pageSize: number;
  searchKeyword: string;
  isActive: boolean;
}

export const getPageQuery = (pageQuery: pageQueryProps) => {
  return `${pageQuery.route}?PageNumber=${pageQuery.pageNumber}
          &PageSize=${pageQuery.pageSize}&SearchKeyword=${pageQuery.searchKeyword}
          &IsActive=${pageQuery.isActive}
          `;
}
