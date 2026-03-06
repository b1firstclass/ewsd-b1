import type { Faculity, FaculitySortKey } from "@/types/faculityType";
import { mapTableListResult } from "@/hooks/table/mapTableListResult";
import {
  createTableListingViewController,
  type TableListingViewController,
} from "@/hooks/table/tableListingViewController";
import { useTableListingController } from "@/hooks/table/useTableListingController";
import { useFaculityList } from "./useFaculityList";

export type FaculityTableController = TableListingViewController<Faculity, FaculitySortKey>;

export const useFaculityTableController = (): FaculityTableController => {
  const baseController = useTableListingController<FaculitySortKey, Record<string, never>>({
    initialFilters: {},
  });

  const listQuery = useFaculityList({
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
    fallbackErrorMessage: "Failed to load faculties.",
  });

  return createTableListingViewController({
    items: mappedResult.items,
    baseController,
    mappedResult,
  });
};
