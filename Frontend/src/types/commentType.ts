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
}