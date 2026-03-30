import type { PageResponse } from "./sharedType";

export interface UserActivityLog {
    activityId: string;
    userId?: string;
    eventType: string;
    resource: string;
    httpMethod?: string;
    statusCode?: string;
    loggedDate?: string;
    durationMs?: number;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
}

export interface UserActivityLogCreateRequest {
    eventType: string;
    resource: string;
    httpMethod?: string;
    statusCode?: string;
    durationMs?: number;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
}

export interface UserActivityLogListResponse extends PageResponse {
    items: UserActivityLog[];
}

export type UserActivityLogSortKey = 
    | "loggedDate"
    | "eventType"
    | "resource"
    | "userId";

// Activity event types
export const ACTIVITY_EVENT_TYPES = {
    PAGE_VIEW: "Page_View",
    API_CALL: "API_Call",
    LOGIN: "Login",
    LOGOUT: "Logout",
    FILE_DOWNLOAD: "File_Download",
    SUBMISSION_CREATE: "Submission_Create",
    SUBMISSION_UPDATE: "Submission_Update",
    COMMENT_CREATE: "Comment_Create",
    ROLE_CHANGE: "Role_Change",
} as const;

// Device types
export const DEVICE_TYPES = {
    DESKTOP: "Desktop",
    MOBILE: "Mobile",
    TABLET: "Tablet",
} as const;

// Browser types
export const BROWSER_TYPES = {
    CHROME: "Chrome",
    SAFARI: "Safari",
    FIREFOX: "Firefox",
    EDGE: "Edge",
    OTHER: "Other",
} as const;
