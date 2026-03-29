import type { PageResponse } from "./sharedType";

export interface BrowserListInfo {
  browser: string | null;
  count: number;
}

export interface ContributionCountByFacultyAcademicYearInfo {
  facultyName: string | null;
  academicYearStart: number | null;
  academicYearEnd: number | null;
  totalContributions: number;
}

export interface ContributionPercentageByFacultyAcademicYearInfo {
  facultyName: string | null;
  academicYearStart: number | null;
  academicYearEnd: number | null;
  facultyContributions: number;
  yearTotalContributions: number;
  contributionPercentage: number;
}

export interface ContributionsWithoutCommentInfo {
  contributionId: string | null;
  facultyId: string | null;
  facultyName: string | null;
  contributionWindowId: string | null;
  academicYearStart: number | null;
  academicYearEnd: number | null;
  userId: string | null;
  fullName: string | null;
  subject: string | null;
  createdDate: string | null;
}

export interface ContributionsWithoutCommentListResponse extends PageResponse {
  items: ContributionsWithoutCommentInfo[];
  count: number;
  totalCount?: number;
}

export interface PageAccessCountInfo {
  resource: string | null;
  count: number;
}

export interface UserActivityCountInfo {
  fullName: string | null;
  userId: string | null;
  count: number;
}

export interface DeviceActivityCountInfo {
  device: string | null;
  count: number;
}

export interface ActivityCountByHourInfo {
  hour: string | null;
  count: number;
}

export interface ContributionStatusCountInfo {
  status: string;
  count: number;
}

export interface ContributionStatusSummaryInfo {
  items: ContributionStatusCountInfo[];
  totalCount: number;
}

export interface FacultyContributionStatusSummaryInfo {
  facultyId: string;
  facultyName: string;
  items: ContributionStatusCountInfo[];
  totalCount: number;
}

export interface FacultyUserCountInfo {
  facultyId: string;
  facultyName: string;
  count: number;
}

export interface TopContributorInfo {
  userId: string;
  fullName: string;
  facultyName: string;
  contributionCount: number;
}
