import { roleKeys } from "@/types/constantQueryKey";
import type { PageParams } from "@/types/sharedType";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { roleApi } from "../roleApi";
import { ApiRoute } from "@/types/constantApiRoute";

export const useRoleList = ({
    pageNumber,
    pageSize,
    searchKeyword,
    isActive,
}: PageParams) => {
    return useQuery({
        queryKey: roleKeys.list(pageNumber, pageSize, searchKeyword, isActive),
        queryFn: () =>
            roleApi.getList({
                route: ApiRoute.Role.List,
                pageNumber,
                pageSize,
                searchKeyword,
                isActive,
            }),
        placeholderData: keepPreviousData,
    });
};
