import { createTableListingViewController, type TableListingViewController } from "@/hooks/table/tableListingViewController";
import { useTableListingController } from "@/hooks/table/useTableListingController";
import { mapTableListResult } from "@/hooks/table/mapTableListResult";
import type { User, UserSortKey } from "@/types/userType";
import { useGuestUserList } from "./useGuestUserList";

export type GuestListTableController = TableListingViewController<User, UserSortKey>;

export const useGuestListTableController = (): GuestListTableController => {
  const baseController = useTableListingController<UserSortKey, Record<string, never>>({
    initialFilters: {},
  });

  const listQuery = useGuestUserList({
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
    fallbackErrorMessage: "Failed to load guest users.",
  });

  return createTableListingViewController({
    items: mappedResult.items,
    baseController,
    mappedResult,
  });
};
