import { api, formDataApi } from "@/lib/api/client";
import { downloadBlobResponse, getPageQuery, type pageQueryProps } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type {
    ContributionBulkSelectRequest,
    ContributionCreateForm,
    ContributionDetailInfo,
    ContributionInfo,
    ContributionListResponse,
    ContributionStatusValue,
    ContributionUpdateForm,
} from "@/types/contributionType";
import { toContributionCreateFormData, toContributionUpdateFormData } from "@/types/formData";
import type { ApiResponse } from "@/types/sharedType";

export const contributionApi = {
    /**
     * GET /Contributions — paginated list
     * Students see their own contributions; Coordinators see their faculty's (non-draft)
     * Optional status filter
     */
    getList: async (request: pageQueryProps, status?: ContributionStatusValue): Promise<ContributionListResponse> => {
        let url = getPageQuery({ ...request, route: ApiRoute.Contribution.List });
        if (status) {
            url += `&Status=${encodeURIComponent(status)}`;
        }
        const response = await api.get<ApiResponse<ContributionListResponse>>(url);
        return response.data.data;
    },

    /**
     * GET /Contributions/{id} — detail with documents + comments
     */
    getById: async (id: string): Promise<ContributionDetailInfo> => {
        console.log("Get Contribution by id request =>>");
        const response = await api.get<ApiResponse<ContributionDetailInfo>>(ApiRoute.Contribution.GetById(id));
        console.log("GetById response=>>> ",response.data.data );
        return response.data.data;
    },

    /**
     * POST /Contributions — create new contribution (multipart/form-data)
     * Always creates as Draft status
     */
    create: async (request: ContributionCreateForm): Promise<ContributionInfo> => {
        const formData = toContributionCreateFormData(request);
        const response = await formDataApi.post<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.Create, formData);
        return response.data.data;
    },

    /**
     * PUT /Contributions/{id} — update contribution (multipart/form-data)
     * Only allowed when status is Draft or Revision Required
     */
    update: async (id: string, request: ContributionUpdateForm): Promise<ContributionInfo> => {
        const formData = toContributionUpdateFormData(request);
        const response = await formDataApi.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.Update(id), formData);
        return response.data.data;
    },

    /**
     * PUT /Contributions/{id}/submit — submit a Draft/RevisionRequired contribution
     * Transitions status to Submitted and emails faculty coordinators
     */
    submit: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.submit(id));
        return response.data.data;
    },

    // ─── Coordinator Actions ────────────────────────────────────────────

    /**
     * PUT /Contributions/{id}/review — Submitted → Under Review
     */
    review: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.review(id));
        return response.data.data;
    },

    /**
     * PUT /Contributions/{id}/approve — Under Review → Approved
     */
    approve: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.approve(id));
        return response.data.data;
    },

    /**
     * PUT /Contributions/{id}/reject — Under Review → Rejected
     */
    reject: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.reject(id));
        return response.data.data;
    },

    /**
     * PUT /Contributions/{id}/request-revision — Under Review → Revision Required
     */
    requestRevision: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.requestRevision(id));
        return response.data.data;
    },

    /**
     * PUT /Contributions/{id}/select — Approved → Selected
     */
    select: async (id: string): Promise<ContributionInfo> => {
        const response = await api.put<ApiResponse<ContributionInfo>>(ApiRoute.Contribution.select(id));
        return response.data.data;
    },

    /**
     * PUT /Contributions/select — bulk select approved contributions
     */
    selectBulk: async (request: ContributionBulkSelectRequest): Promise<ContributionInfo[]> => {
        const response = await api.put<ApiResponse<ContributionInfo[]>>(ApiRoute.Contribution.selectList, request);
        return response.data.data;
    },

    // ─── Manager/Guest Selected Contributions ───────────────────────────

    /**
     * GET /Contributions/selected — paginated list of selected contributions
     * For Manager and Guest roles only
     */
    getSelectedList: async (request: pageQueryProps): Promise<ContributionListResponse> => {
        const url = getPageQuery({ ...request, route: ApiRoute.Contribution.getSelectedList });
        const response = await api.get<ApiResponse<ContributionListResponse>>(url);
        return response.data.data;
    },

    // ─── Document Downloads ─────────────────────────────────────────────

    /**
     * GET /Contributions/documents/{documentId}/download — download a single document
     */
    downloadDocument: async (documentId: string, fileName?: string): Promise<void> => {
        const response = await api.get<Blob>(
            `/Contributions/documents/${documentId}/download`,
            { responseType: "blob" }
        );
        downloadBlobResponse(response, fileName);
    },

    /**
     * GET /Contributions/selected/{id}/download — download selected contribution files as ZIP
     * Manager only
     */
    downloadSelected: async (id: string): Promise<void> => {
        const response = await api.get<Blob>(
            ApiRoute.Contribution.downloadSelected(id),
            { responseType: "blob" }
        );
        downloadBlobResponse(response);
    },

    /**
     * POST /Contributions/selected/download — bulk download selected contributions as ZIP
     * Manager only
     */
    downloadSelectedBulk: async (request: ContributionBulkSelectRequest): Promise<void> => {
        const response = await api.post<Blob>(
            ApiRoute.Contribution.downloadSelectedList,
            request,
            { responseType: "blob" }
        );
        downloadBlobResponse(response);
    },
};
