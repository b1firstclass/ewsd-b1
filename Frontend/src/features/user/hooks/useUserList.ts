import { userKeys } from "@/types/constantQueryKey";
import type { PageParams } from "@/types/sharedType";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { userApi } from "../userApi";
import { ApiRoute } from "@/types/constantApiRoute";

export const useUserList = ({
    pageNumber,
    pageSize,
    searchKeyword,
    isActive = true,
}: PageParams) => {
    return useQuery({
        queryKey: userKeys.list(pageNumber, pageSize, searchKeyword, isActive),
        queryFn: () =>
            userApi.getList({
                route: ApiRoute.User.List,
                pageNumber,
                pageSize,
                searchKeyword,
                isActive,
            }),
        placeholderData: keepPreviousData,
    });
};