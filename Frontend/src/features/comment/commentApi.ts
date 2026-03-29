import { api } from "@/lib/api/client";
import { ApiRoute } from "@/types/constantApiRoute";
import type { CommentInfo, CommentCreateRequest } from "@/types/commentType";
import type { ApiResponse } from "@/types/sharedType";

export const commentApi = {
    /** GET /Comments/contribution/{contributionId} */
    getByContributionId: async (contributionId: string): Promise<CommentInfo[]> => {
        const response = await api.get<ApiResponse<CommentInfo[]>>(
            ApiRoute.Comment.getByContributionId(contributionId)
        );
        return response.data.data;
    },

    /** POST /Comments */
    create: async (request: CommentCreateRequest): Promise<CommentInfo> => {
        const response = await api.post<ApiResponse<CommentInfo>>(ApiRoute.Comment.Create, request);
        return response.data.data;
    },

    /** DELETE /Comments/{id} */
    delete: async (id: string): Promise<void> => {
        await api.delete(ApiRoute.Comment.Delete(id));
    },
};
