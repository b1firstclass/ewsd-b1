import type { CommentInfo } from "./commentType";
import type { PageResponse } from "./sharedType";

export interface ContributionInfo {
    id: string;
    contributionWindowId: string;
    subject: string;
    description: string;
    status: string;
    isActive: boolean;
    createdDate?: string;
    modifiedDate?: string;
}

export interface ContributionDocumentInfo {
    id: string;
    fileName: string;
    extension: string;
    size: number;
    isActive: boolean;
    createdDate?: string;
    createdBy?: string;
    modifiedDate?: string;
    modifiedBy?: string;
}

export interface ContributionDetailInfo extends ContributionInfo {
    Documents: ContributionDocumentInfo[];
    Comments: CommentInfo[];
}

export interface ContributionCreateForm {
    contributionWindowId: string;
    facultyId: string;
    subject: string;
    description: string;
    documentFile: File;
    imageFile?: File | null;
}

export interface ContributionUpdateForm {
    subject?: string | null;
    description?: string | null;
    documentFile?: File | null;
    imageFile?: File | null;
}

export interface ContributionBulkSelectRequest {
    contributionIds: string[];
}

export interface ContributionListResonse extends PageResponse {
    items: ContributionInfo[];
}

export const ContributionStatus = {
    StatusDraft: "Draft",
    StatusSubmitted: "Submitted",
    StatusUnderReview: "Under Review",
    StatusRevisionRequired: "Revision Required",
    StatusApproved: "Approved",
    StatusRejected: "Rejected",
    StatusSelected: "Selected",
}