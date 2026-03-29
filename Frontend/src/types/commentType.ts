export interface CommentInfo {
    id: string;
    contributionId: string;
    comment: string;
    isActive: boolean;
    poster: string;
    createdBy?: string;
    modifiedBy?: string;
    createdDate?: string;
    modifiedDate?: string;
    daysRemaining?: number;
    isOverdue?: boolean;
    isUrgent?: boolean;
    deadlineStatus?: 'normal' | 'urgent' | 'overdue';
}

export interface CommentCreateRequest {
    contributionId: string;
    comment: string;
}

export interface CommentListResponse {
    items: CommentInfo[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export type CommentSortKey = "createdDate" | "comment" | "poster";