import { mapTableListResult } from "@/hooks/table/mapTableListResult";
import {
  createTableListingViewController,
  type TableListingViewController,
} from "@/hooks/table/tableListingViewController";
import { useTableListingController } from "@/hooks/table/useTableListingController";
import type {
  ContributionWindowInfo,
  ContributionWindowSortKey,
} from "@/types/contributionWindowType";
import { useContributionWindowList } from "./useContributionWindowList";

export type ContributionWindowTableController = TableListingViewController<
  ContributionWindowInfo,
  ContributionWindowSortKey
>;

export const useContributionWindowTableController = (): ContributionWindowTableController => {
  const baseController = useTableListingController<ContributionWindowSortKey, Record<string, never>>({
    initialFilters: {},
  });

  const listQuery = useContributionWindowList({
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
    fallbackErrorMessage: "Failed to load contribution windows.",
  });

  return createTableListingViewController({
    items: mappedResult.items,
    baseController,
    mappedResult,
  });
};
