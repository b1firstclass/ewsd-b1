export interface ApiResponse<T> {
    message?: string | null;
    data: T;
    errors?: Record<string,string[]> | null;
}

