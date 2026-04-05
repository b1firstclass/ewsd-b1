import { guestUserKeys } from "@/types/constantQueryKey";
import type { PageParams } from "@/types/sharedType";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { getPageQuery } from "@/lib/utils";
import { ApiRoute } from "@/types/constantApiRoute";
import type { ApiResponse } from "@/types/sharedType";
import type { UserListResponse } from "@/types/userType";

const fetchGuestUsers = async (params: PageParams): Promise<UserListResponse> => {
    const response = await api.get<ApiResponse<UserListResponse>>(
        getPageQuery({
            route: ApiRoute.GuestManagement.getGuestList,
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
            searchKeyword: params.searchKeyword,
            isActive: params.isActive,
        }),
    );
    return response.data.data;
};

export const useGuestUserList = ({
    pageNumber,
    pageSize,
    searchKeyword,
    isActive = true,
}: PageParams) => {
    return useQuery({
        queryKey: guestUserKeys.list(pageNumber, pageSize, searchKeyword, isActive),
        queryFn: () =>
            fetchGuestUsers({ pageNumber, pageSize, searchKeyword, isActive }),
        placeholderData: keepPreviousData,
    });
};
