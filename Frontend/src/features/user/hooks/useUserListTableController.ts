import { createTableListingViewController, type TableListingViewController } from "@/hooks/table/tableListingViewController";
import { useTableListingController } from "@/hooks/table/useTableListingController";
import type { User, UserSortKey } from "@/types/userType";
import { useUserList } from "./useUserList";
import { mapTableListResult } from "@/hooks/table/mapTableListResult";

export type UserTableController = TableListingViewController<User, UserSortKey>;

export const useUserTableController = (): UserTableController => {
  const baseController = useTableListingController<UserSortKey, Record<string, never>>({
    initialFilters: {},
  });

  const listQuery = useUserList({
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
    fallbackErrorMessage: "Failed to load Users.",
  });

  return createTableListingViewController({
    items: mappedResult.items,
    baseController,
    mappedResult,
  });
};