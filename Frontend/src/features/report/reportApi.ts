import { api } from "@/lib/api/client";
import { getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type {
  BrowserListInfo,
  ContributionCountByFacultyAcademicYearInfo,
  ContributionPercentageByFacultyAcademicYearInfo,
  ContributionsWithoutCommentListResponse,
  DeviceActivityCountInfo,
  ActivityCountByHourInfo,
  FacultyContributionStatusSummaryInfo,
  FacultyUserCountInfo,
  PageAccessCountInfo,
  TopContributorInfo,
  UserActivityCountInfo,
} from "@/types/reportType";
import type { ApiResponse } from "@/types/sharedType";

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
};

const normalizeWithoutCommentResponse = (
  value: ContributionsWithoutCommentListResponse | { items?: unknown[]; count?: unknown }
): ContributionsWithoutCommentListResponse => {
  const rawItems: unknown[] = Array.isArray((value as { items?: unknown[] }).items)
    ? (value as { items?: unknown[] }).items ?? []
    : [];
  const countValue = (value as { count?: unknown }).count;
  const totalCountValue = (value as { totalCount?: unknown }).totalCount;

  return {
    items: rawItems as ContributionsWithoutCommentListResponse["items"],
    count: toNumber(countValue ?? totalCountValue ?? rawItems.length),
    pageNumber: toNumber((value as { pageNumber?: unknown }).pageNumber) || 1,
    pageSize: toNumber((value as { pageSize?: unknown }).pageSize) || rawItems.length || 1,
    totalPages: toNumber((value as { totalPages?: unknown }).totalPages) || 1,
    hasNextPage: Boolean((value as { hasNextPage?: unknown }).hasNextPage),
    hasPreviousPage: Boolean((value as { hasPreviousPage?: unknown }).hasPreviousPage),
    totalCount: toNumber(totalCountValue ?? countValue ?? rawItems.length),
  };
};

export const reportApi = {
  getContributionCountByFaculty: async (): Promise<ContributionCountByFacultyAcademicYearInfo[]> => {
    const response = await api.get<ApiResponse<ContributionCountByFacultyAcademicYearInfo[]>>(
      ApiRoute.Report.contributionCountByFaculty
    );
    return (response.data.data ?? []).map((item) => ({
      ...item,
      totalContributions: toNumber(item.totalContributions),
    }));
  },

  getContributionPercentageByFaculty: async (): Promise<ContributionPercentageByFacultyAcademicYearInfo[]> => {
    const response = await api.get<ApiResponse<ContributionPercentageByFacultyAcademicYearInfo[]>>(
      ApiRoute.Report.contributionPercentageByFaculty
    );
    return (response.data.data ?? []).map((item) => ({
      ...item,
      facultyContributions: toNumber(item.facultyContributions),
      yearTotalContributions: toNumber(item.yearTotalContributions),
      contributionPercentage: toNumber(item.contributionPercentage),
    }));
  },

  getContributionsWithoutComment: async (request: pageQueryProps): Promise<ContributionsWithoutCommentListResponse> => {
    const url = getPageQuery({ ...request, route: ApiRoute.Report.contributionsWithoutComment });
    const response = await api.get<ApiResponse<ContributionsWithoutCommentListResponse | { items?: unknown[]; count?: unknown }>>(url);
    return normalizeWithoutCommentResponse(response.data.data);
  },

  getContributionsWithoutCommentAfter14Days: async (
    request: pageQueryProps
  ): Promise<ContributionsWithoutCommentListResponse> => {
    const url = getPageQuery({
      ...request,
      route: ApiRoute.Report.contributionsWithoutCommentAfter14Days,
    });
    const response = await api.get<ApiResponse<ContributionsWithoutCommentListResponse | { items?: unknown[]; count?: unknown }>>(url);
    return normalizeWithoutCommentResponse(response.data.data);
  },

  getFacultyContributionStatusCount: async (): Promise<FacultyContributionStatusSummaryInfo[]> => {
    const response = await api.get<ApiResponse<FacultyContributionStatusSummaryInfo[]>>(
      ApiRoute.Report.facultyContributionStatusCount
    );
    return response.data.data ?? [];
  },

  getFacultyUserCount: async (): Promise<FacultyUserCountInfo[]> => {
    const response = await api.get<ApiResponse<FacultyUserCountInfo[]>>(ApiRoute.Report.facultyUserCount);
    return response.data.data ?? [];
  },

  getTopContributors: async (contributionWindowId?: string): Promise<TopContributorInfo[]> => {
    const response = await api.get<ApiResponse<TopContributorInfo[]>>(ApiRoute.Report.topContributors, {
      params: contributionWindowId ? { contributionWindowId } : undefined,
    });
    return response.data.data ?? [];
  },

  getBrowserList: async (): Promise<BrowserListInfo[]> => {
    const response = await api.get<ApiResponse<BrowserListInfo[]>>(ApiRoute.Report.browserList);
    return (response.data.data ?? []).map((item) => ({ ...item, count: toNumber(item.count) }));
  },

  getPageAccessCount: async (): Promise<PageAccessCountInfo[]> => {
    const response = await api.get<ApiResponse<PageAccessCountInfo[]>>(ApiRoute.Report.pageAccessCount);
    return (response.data.data ?? []).map((item) => ({ ...item, count: toNumber(item.count) }));
  },

  getUserActivityCount: async (): Promise<UserActivityCountInfo[]> => {
    const response = await api.get<ApiResponse<UserActivityCountInfo[]>>(ApiRoute.Report.userActivityCount);
    return (response.data.data ?? []).map((item) => ({ ...item, count: toNumber(item.count) }));
  },

  getDeviceActivityCount: async (): Promise<DeviceActivityCountInfo[]> => {
    const response = await api.get<ApiResponse<DeviceActivityCountInfo[]>>(ApiRoute.Report.deviceActivityCount);
    return (response.data.data ?? []).map((item) => ({ ...item, count: toNumber(item.count) }));
  },

  getActivityCountByHour: async (fromDate: string, toDate: string): Promise<ActivityCountByHourInfo[]> => {
    const response = await api.get<ApiResponse<ActivityCountByHourInfo[]>>(ApiRoute.Report.activityCountByHour, {
      params: { fromDate, toDate },
    });
    return (response.data.data ?? []).map((item) => ({
      ...item,
      count: toNumber(item.count),
      hour: (item.hour ?? null) as ActivityCountByHourInfo["hour"],
    }));
  },
};
