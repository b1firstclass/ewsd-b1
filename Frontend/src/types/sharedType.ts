export interface ApiResponse<T> {
    message?: string | null;
    data: T;
    errors?: Record<string,string[]> | null;
}

export interface PageResponse{
    pageNumber: number;
    pageSize: number;
    count: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
}

export interface PageParams {
  pageNumber: number;
  pageSize: number;
  searchKeyword: string;
  isActive?: boolean;
}