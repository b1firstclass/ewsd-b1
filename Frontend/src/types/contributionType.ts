import type { CommentInfo } from "./commentType";
import type { CategoryInfo } from "./categoryType";
import type { PageResponse } from "./sharedType";

/**
 * Matches backend DTO: CMS.Application.DTOs.ContributionInfo
 * Mapped from Contribution entity via AutoMapper (ContributionId → Id)
 */
export interface ContributionInfo {
    id: string;
    contributionWindowId: string;
    categoryId?: string | null;
    image?: ContributionImageInfo | null;
    subject: string;
    description: string;
    rating?: number;
    reviewedBy?: string | null;
    status: ContributionStatusValue;
    isActive: boolean;
    createdDate?: string;
    modifiedDate?: string;
    /** Populated by selected-contributions/report endpoints */
    facultyId?: string | null;
    facultyName?: string | null;
    createdUser?: string | null;
    /** Legacy alias retained for older responses */
    createdByName?: string | null;
}

export interface ContributionImageInfo {
    id: string;
    fileName: string;
    extension: string;
    data?: string | null;
}

/**
 * Matches backend DTO: CMS.Application.DTOs.ContributionDocumentInfo
 * Mapped from Document entity via AutoMapper (DocumentId → Id)
 */
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

/**
 * Matches backend DTO: CMS.Application.DTOs.ContributionDetailInfo
 * Returned by GET /Contributions/{id} — includes documents and comments
 */
export interface ContributionDetailInfo extends ContributionInfo {
    category?: CategoryInfo | null;
    documents: ContributionDocumentInfo[];
    comments: CommentInfo[];
}

/**
 * Frontend form model for POST /Contributions (multipart/form-data)
 * Maps to backend ContributionCreateForm via toContributionCreateFormData()
 * 
 * Backend fields: ContributionWindowId, FacultyId, Subject, Description, DocumentFile, ImageFile
 */
export interface ContributionCreateForm {
    contributionWindowId: string;
    facultyId: string;
    categoryId?: string | null;
    subject: string;
    description: string;
    documentFile: File;
    imageFile?: File | null;
}

/**
 * Frontend form model for PUT /Contributions/{id} (multipart/form-data)
 * Maps to backend ContributionUpdateForm via toContributionUpdateFormData()
 * 
 * Backend allows updating: Subject, Description, DocumentFile, ImageFile
 * Only allowed when status is Draft or Revision Required
 */
export interface ContributionUpdateForm {
    subject?: string | null;
    description?: string | null;
    categoryId?: string | null;
    documentFile?: File | null;
    imageFile?: File | null;
}

/**
 * Request body for PUT /Contributions/{id}/rating
 */
export interface ContributionRatingRequest {
    rating: number;
}

/**
 * Request body for PUT /Contributions/select (bulk select)
 */
export interface ContributionBulkSelectRequest {
    contributionIds: string[];
}

/**
 * Paginated list response from GET /Contributions
 */
export interface ContributionListResponse extends PageResponse {
    items: ContributionInfo[];
}

/**
 * All possible contribution statuses — matches backend ContributionConstants
 * 
 * Status flow:
 *   Student creates → Draft
 *   Student submits → Submitted (emails coordinators)
 *   Coordinator reviews → Under Review
 *     ├── approve → Approved → select → Selected
 *     ├── reject → Rejected
 *     └── request-revision → Revision Required → Student edits → re-submit
 */
export const ContributionStatus = {
    Draft: "Draft",
    Submitted: "Submitted",
    UnderReview: "Under Review",
    RevisionRequired: "Revision Required",
    Approved: "Approved",
    Rejected: "Rejected",
    Selected: "Selected",
} as const;

export type ContributionStatusValue = typeof ContributionStatus[keyof typeof ContributionStatus];

/**
 * Statuses where the student can edit their contribution
 */
export const EDITABLE_STATUSES: ContributionStatusValue[] = [
    ContributionStatus.Draft,
    ContributionStatus.RevisionRequired,
];

/**
 * Statuses where the student can submit (Draft → Submitted, RevisionRequired → Submitted)
 */
export const SUBMITTABLE_STATUSES: ContributionStatusValue[] = [
    ContributionStatus.Draft,
    ContributionStatus.RevisionRequired,
];

/**
 * File constraints — matches backend ContributionConstants
 */
export const ContributionFileConstraints = {
    maxDocumentSizeBytes: 10 * 1024 * 1024, // 10MB
    maxImageSizeBytes: 5 * 1024 * 1024,     // 5MB
    allowedDocumentExtensions: [".doc", ".docx"],
    allowedImageExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
} as const;
