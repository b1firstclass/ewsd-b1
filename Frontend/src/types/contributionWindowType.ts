import type { PageResponse } from "./sharedType";

export interface ContributionWindowInfo {
    id: string;
    submissionOpenDate?: string;
    submissionEndDate?: string;  // Initial deadline
    closureDate?: string;         // Final closure date
    academicYearStart: number;
    academicYearEnd: number;
    isActive: boolean;
    createdDate: string;
    modifiedDate: string;
    // Add deadline status helpers
    daysToSubmission?: number;
    daysToClosure?: number;
    submissionStatus?: 'open' | 'submission-ended' | 'closed';
}

export interface ContributionWindowCreateRequest {
    submissionOpenDate: string;
    submissionEndDate: string;
    closureDate: string;
    academicYearStart: number;
    academicYearEnd: number;
}

export interface ContributionWindowUpdateRequest {
    submissionOpenDate?: string;
    submissionEndDate?: string;
    closureDate?: string;
    academicYearStart?: number;
    academicYearEnd?: number;
    isActive?: boolean;
}

export interface ContributionWindowStatusResponse {
    currentTimeUtc: string;
    isInContributionWindow: boolean;
    isSubmissionAllowed: boolean;
    window?: ContributionWindowInfo;
}

export interface ContributionWindowListResponse extends PageResponse {
    items: ContributionWindowInfo[];
}

export type ContributionWindowSortKey =
    | "academicYearStart"
    | "submissionOpenDate"
    | "closureDate";
