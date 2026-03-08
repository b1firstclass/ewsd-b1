import { getErrorMessage } from "@/lib/utils";
import type { TableListingControllerResult } from "./useTableListingController";

export interface TableListQueryLike<TData> {
  data?: TData;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown> | unknown;
}

interface MapTableListResultSelectors<TData, TItem> {
  items: (data: TData) => TItem[];
  totalCount?: (data: TData) => number | undefined;
  totalPages?: (data: TData) => number | undefined;
}

interface MapTableListResultOptions<
  TItem,
  TSortKey extends string,
  TFilters extends Record<string, unknown>,
  TData,
> {
  baseController: Pick<TableListingControllerResult<TSortKey, TFilters>, "sort" | "queryParams">;
  listQuery: TableListQueryLike<TData>;
  select: MapTableListResultSelectors<TData, TItem>;
  getSortValue: (item: TItem, key: TSortKey) => string | number | boolean | null | undefined;
  fallbackErrorMessage: string;
}

export interface TableRequestState {
  isLoading: boolean;
  isFetching: boolean;
  error?: string | null;
  onRetry: () => void;
}

export interface TableMappedListResult<TItem> {
  items: TItem[];
  totalCount: number;
  totalPages: number;
  state: TableRequestState;
}

const toComparableString = (value: string | number | boolean | null | undefined) => {
  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return value?.toString().toLowerCase() ?? "";
};

export const mapTableListResult = <
  TItem,
  TSortKey extends string,
  TFilters extends Record<string, unknown>,
  TData,
>({
  baseController,
  listQuery,
  select,
  getSortValue,
  fallbackErrorMessage,
}: MapTableListResultOptions<TItem, TSortKey, TFilters, TData>): TableMappedListResult<TItem> => {
  const items = listQuery.data ? select.items(listQuery.data) : [];
  const sortedItems = baseController.sort.key === ""
    ? [...items]
    : [...items].sort((left, right) => {
        const activeSortKey = baseController.sort.key as TSortKey;
        const leftValue = toComparableString(getSortValue(left, activeSortKey));
        const rightValue = toComparableString(getSortValue(right, activeSortKey));
        const comparison = leftValue.localeCompare(rightValue);
        return baseController.sort.direction === "asc" ? comparison : -comparison;
      });

  const totalCount = listQuery.data ? (select.totalCount?.(listQuery.data) ?? sortedItems.length) : sortedItems.length;
  const resolvedTotalPages = listQuery.data
    ? (select.totalPages?.(listQuery.data) ?? Math.ceil(totalCount / Math.max(baseController.queryParams.pageSize, 1)))
    : Math.ceil(totalCount / Math.max(baseController.queryParams.pageSize, 1));
  const totalPages = Math.max(resolvedTotalPages || 1, 1);

  const error = listQuery.isError
    ? getErrorMessage(listQuery.error, fallbackErrorMessage)
    : null;

  return {
    items: sortedItems,
    totalCount,
    totalPages,
    state: {
      isLoading: listQuery.isLoading && !listQuery.data,
      isFetching: listQuery.isFetching,
      error,
      onRetry: () => {
        void listQuery.refetch();
      },
    },
  };
};
