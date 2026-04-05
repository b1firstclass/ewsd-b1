// Backend API Integration
// Based on CMS Postman Collection and ewsd-b1 Backend

import { api } from "@/lib/api/client";
import type { PageParams } from "@/types/sharedType";

// Base API response wrapper
export interface BackendApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
}

// Backend page response wrapper
export interface BackendPageResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Login request/response types
export interface LoginRequest {
    loginId: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    expiresAt: string;
    refreshToken: string;
    firstTimeLogin: boolean;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
}

// User types
export interface UserProfile {
    userId: string;
    loginId: string;
    email: string;
    fullName: string;
    roleId: string;
    roleName: string;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
    lastLoginDate?: string;
    faculties?: Array<{
        facultyId: string;
        facultyName: string;
    }>;
}

export interface UserListParams extends PageParams {
    isActive?: boolean;
}

// Default page params for API calls
const defaultPageParams: PageParams = {
    pageNumber: 1,
    pageSize: 10,
    searchKeyword: ''
};

export interface UserCreateRequest {
    loginId: string;
    password: string;
    email: string;
    fullName: string;
    roleId: string;
    facultyIds?: string[];
}

export interface UserUpdateRequest {
    email?: string;
    fullName?: string;
    roleId?: string;
    facultyIds?: string[];
    isActive?: boolean;
}

// Role types
export interface Role {
    roleId: string;
    name: string;
    description: string;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
}

// Faculty types
export interface Faculty {
    facultyId: string;
    facultyName: string;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
}

// Contribution Window types
export interface ContributionWindow {
    contributionWindowId: string;
    submissionOpenDate: string;
    submissionEndDate: string;
    closureDate: string;
    academicYearStart: number;
    academicYearEnd: number;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
}

// Contribution types
export interface Contribution {
    contributionId: string;
    userId: string;
    facultyId: string;
    contributionWindowId: string;
    subject: string;
    description: string;
    rating: number;
    status: 'Submitted' | 'Under Review' | 'Approved' | 'Selected' | 'Rejected';
    isActive: boolean;
    createdDate: string;
    submittedDate?: string;
    reviewedDate?: string;
    modifiedDate: string;
    commentedDate?: string;
    commentedBy?: string;
}

export interface ContributionCreateRequest {
    userId: string;
    facultyId: string;
    contributionWindowId: string;
    subject: string;
    description: string;
}

export interface ContributionUpdateRequest {
    subject?: string;
    description?: string;
    rating?: number;
    status?: string;
}

// Comment types
export interface Comment {
    commentId: string;
    contributionId: string;
    comment: string;
    isActive: boolean;
    createdDate: string;
    createdBy: string;
    modifiedDate: string;
    modifiedBy: string;
    poster: string;
}

export interface CommentCreateRequest {
    contributionId: string;
    comment: string;
}

// Permission types
export interface Permission {
    permissionId: string;
    name: string;
    description: string;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
}

// Contribution Window Status type
export interface ContributionWindowStatus {
    currentWindow: {
        contributionWindowId: string;
        submissionOpenDate: string;
        submissionEndDate: string;
        closureDate: string;
        academicYearStart: number;
        academicYearEnd: number;
        isActive: boolean;
    } | null;
    nextWindow: {
        contributionWindowId: string;
        submissionOpenDate: string;
        submissionEndDate: string;
        closureDate: string;
        academicYearStart: number;
        academicYearEnd: number;
        isActive: boolean;
    } | null;
    daysUntilSubmission: number;
    daysUntilClosure: number;
    canSubmit: boolean;
    canEdit: boolean;
}

// Activity Log types
export interface ActivityLog {
    activityId: string;
    userId: string;
    eventType: string;
    resource: string;
    httpMethod: string;
    statusCode: string;
    loggedDate: string;
    durationMs: number;
    ipAddress: string;
    userAgent: string;
    device: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
}

export interface ActivityLogRouteRequest {
    route: string;
}

// Backend API Service
export const backendApi = {
    // Authentication
    auth: {
        login: async (credentials: LoginRequest): Promise<LoginResponse> => {
            const response = await api.post<BackendApiResponse<LoginResponse>>('/Users/login', credentials);
            return response.data.data;
        },
        
        refreshToken: async (request: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
            const response = await api.post<BackendApiResponse<RefreshTokenResponse>>('/Users/refresh-token', request);
            return response.data.data;
        },
        
        logout: async (): Promise<void> => {
            // Backend might not have explicit logout, just clear tokens on client
            console.log('Logout - clearing client tokens');
        }
    },

    // Users
    user: {
        getProfile: async (): Promise<UserProfile> => {
            const response = await api.get<BackendApiResponse<UserProfile>>('/Users/profile');
            return response.data.data;
        },
        
        getList: async (params: UserListParams = defaultPageParams): Promise<BackendPageResponse<UserProfile>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<UserProfile>>>('/Users', { params });
            return response.data.data;
        },
        
        getById: async (userId: string): Promise<UserProfile> => {
            const response = await api.get<BackendApiResponse<UserProfile>>(`/Users/${userId}`);
            return response.data.data;
        },
        
        create: async (request: UserCreateRequest): Promise<UserProfile> => {
            const response = await api.post<BackendApiResponse<UserProfile>>('/Users', request);
            return response.data.data;
        },
        
        update: async (userId: string, request: UserUpdateRequest): Promise<UserProfile> => {
            const response = await api.put<BackendApiResponse<UserProfile>>(`/Users/${userId}`, request);
            return response.data.data;
        },
        
        delete: async (userId: string): Promise<void> => {
            await api.delete(`/Users/${userId}`);
        }
    },

    // Roles
    role: {
        getList: async (params: PageParams = defaultPageParams): Promise<BackendPageResponse<Role>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<Role>>>('/Roles', { params });
            return response.data.data;
        },
        
        getActiveList: async (): Promise<Role[]> => {
            const response = await api.get<BackendApiResponse<Role[]>>('/Roles/active');
            return response.data.data;
        },
        
        getById: async (roleId: string): Promise<Role> => {
            const response = await api.get<BackendApiResponse<Role>>(`/Roles/${roleId}`);
            return response.data.data;
        },
        
        create: async (request: Partial<Role>): Promise<Role> => {
            const response = await api.post<BackendApiResponse<Role>>('/Roles', request);
            return response.data.data;
        },
        
        update: async (roleId: string, request: Partial<Role>): Promise<Role> => {
            const response = await api.put<BackendApiResponse<Role>>(`/Roles/${roleId}`, request);
            return response.data.data;
        },
        
        delete: async (roleId: string): Promise<void> => {
            await api.delete(`/Roles/${roleId}`);
        }
    },

    // Permissions
    permission: {
        getList: async (params: PageParams = defaultPageParams): Promise<BackendPageResponse<Permission>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<Permission>>>('/Permissions', { params });
            return response.data.data;
        },
        
        getActiveList: async (): Promise<Permission[]> => {
            const response = await api.get<BackendApiResponse<Permission[]>>('/Permissions/active');
            return response.data.data;
        }
    },

    // Faculties
    faculty: {
        getList: async (params: PageParams = defaultPageParams): Promise<BackendPageResponse<Faculty>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<Faculty>>>('/Faculties', { params });
            return response.data.data;
        },
        
        getActiveList: async (): Promise<Faculty[]> => {
            const response = await api.get<BackendApiResponse<Faculty[]>>('/Faculties/active');
            return response.data.data;
        },
        
        getById: async (facultyId: string): Promise<Faculty> => {
            const response = await api.get<BackendApiResponse<Faculty>>(`/Faculties/${facultyId}`);
            return response.data.data;
        },
        
        create: async (request: Partial<Faculty>): Promise<Faculty> => {
            const response = await api.post<BackendApiResponse<Faculty>>('/Faculties', request);
            return response.data.data;
        },
        
        update: async (facultyId: string, request: Partial<Faculty>): Promise<Faculty> => {
            const response = await api.put<BackendApiResponse<Faculty>>(`/Faculties/${facultyId}`, request);
            return response.data.data;
        },
        
        delete: async (facultyId: string): Promise<void> => {
            await api.delete(`/Faculties/${facultyId}`);
        }
    },

    // Contribution Windows
    contributionWindow: {
        getList: async (params: PageParams = defaultPageParams): Promise<BackendPageResponse<ContributionWindow>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<ContributionWindow>>>('/ContributionWindows', { params });
            return response.data.data;
        },
        
        getStatus: async (): Promise<ContributionWindowStatus> => {
            const response = await api.get<BackendApiResponse<ContributionWindowStatus>>('/ContributionWindows/status');
            return response.data.data;
        },
        
        getById: async (windowId: string): Promise<ContributionWindow> => {
            const response = await api.get<BackendApiResponse<ContributionWindow>>(`/ContributionWindows/${windowId}`);
            return response.data.data;
        },
        
        create: async (request: Partial<ContributionWindow>): Promise<ContributionWindow> => {
            const response = await api.post<BackendApiResponse<ContributionWindow>>('/ContributionWindows', request);
            return response.data.data;
        },
        
        update: async (windowId: string, request: Partial<ContributionWindow>): Promise<ContributionWindow> => {
            const response = await api.put<BackendApiResponse<ContributionWindow>>(`/ContributionWindows/${windowId}`, request);
            return response.data.data;
        },
        
        delete: async (windowId: string): Promise<void> => {
            await api.delete(`/ContributionWindows/${windowId}`);
        }
    },

    // Contributions
    contribution: {
        getList: async (params: PageParams & { userId?: string; facultyId?: string; status?: string } = defaultPageParams): Promise<BackendPageResponse<Contribution>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<Contribution>>>('/Contributions', { params });
            return response.data.data;
        },
        
        getById: async (contributionId: string): Promise<Contribution> => {
            const response = await api.get<BackendApiResponse<Contribution>>(`/Contributions/${contributionId}`);
            return response.data.data;
        },
        
        create: async (request: ContributionCreateRequest): Promise<Contribution> => {
            const response = await api.post<BackendApiResponse<Contribution>>('/Contributions', request);
            return response.data.data;
        },
        
        submit: async (request: ContributionCreateRequest): Promise<Contribution> => {
            const response = await api.post<BackendApiResponse<Contribution>>('/Contributions/submit', request);
            return response.data.data;
        },
        
        update: async (contributionId: string, request: ContributionUpdateRequest): Promise<Contribution> => {
            const response = await api.put<BackendApiResponse<Contribution>>(`/Contributions/${contributionId}`, request);
            return response.data.data;
        },
        
        delete: async (contributionId: string): Promise<void> => {
            await api.delete(`/Contributions/${contributionId}`);
        }
    },

    // Comments
    comment: {
        getList: async (params: PageParams & { contributionId?: string } = defaultPageParams): Promise<BackendPageResponse<Comment>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<Comment>>>('/Comments', { params });
            return response.data.data;
        },
        
        getById: async (commentId: string): Promise<Comment> => {
            const response = await api.get<BackendApiResponse<Comment>>(`/Comments/${commentId}`);
            return response.data.data;
        },
        
        create: async (request: CommentCreateRequest): Promise<Comment> => {
            const response = await api.post<BackendApiResponse<Comment>>('/Comments', request);
            return response.data.data;
        },
        
        update: async (commentId: string, request: Partial<Comment>): Promise<Comment> => {
            const response = await api.put<BackendApiResponse<Comment>>(`/Comments/${commentId}`, request);
            return response.data.data;
        },
        
        delete: async (commentId: string): Promise<void> => {
            await api.delete(`/Comments/${commentId}`);
        }
    },

    // Activity Logs
    activityLog: {
        getList: async (params?: (PageParams & { userId?: string; eventType?: string })): Promise<BackendPageResponse<ActivityLog>> => {
            const response = await api.get<BackendApiResponse<BackendPageResponse<ActivityLog>>>('/ActivityLog', params ? { params } : undefined);
            return response.data.data;
        },

        create: async (request: ActivityLogRouteRequest): Promise<void> => {
            await api.post<BackendApiResponse<null>>('/ActivityLog', request);
        },
    }
};

export default backendApi;
