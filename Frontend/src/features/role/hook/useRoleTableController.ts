import { createTableListingViewController, type TableListingViewController } from "@/hooks/table/tableListingViewController";
import { useTableListingController } from "@/hooks/table/useTableListingController";
import type { Role, RoleSortKey } from "@/types/roleType";
import { useRoleList } from "./useRoleList";
import { mapTableListResult } from "@/hooks/table/mapTableListResult";

export type RoleTableController = TableListingViewController<Role, RoleSortKey>;

export const useRoleTableController = (): RoleTableController => {
    const baseController = useTableListingController<RoleSortKey, Record<string, never>>({
        initialFilters: {},
    });

    const listQuery = useRoleList({
        pageNumber: baseController.queryParams.pageNumber,
        pageSize: baseController.queryParams.pageSize,
        searchKeyword: baseController.queryParams.searchKeyword,
    });

    const mappedResult = mapTableListResult({
        baseController,
        listQuery,
        select: {
            items: (data) => data.items,
            totalCount: (data) => data.count,
            totalPages: (data) => data.totalPages,
        },
        getSortValue: (item, key) => item[key],
        fallbackErrorMessage: "Failed to load roles.",
    });

    return createTableListingViewController({
        items: mappedResult.items,
        baseController,
        mappedResult,
    });
};
