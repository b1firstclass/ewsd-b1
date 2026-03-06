import { useCallback, useEffect, useState } from "react";
import { PAGE_SIZE_OPTIONS } from "./tableListingViewController";

export type TableSortDirection = "asc" | "desc";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

interface TableSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export interface UseTableListingControllerOptions<TFilters extends Record<string, unknown>> {
  initialFilters: TFilters;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  search?: TableSearchOptions;
}

export interface TableQueryParams<TFilters extends Record<string, unknown>> {
  pageNumber: number;
  pageSize: number;
  searchKeyword: string;
  filters: TFilters;
}

export interface TableToolbarState<TFilters extends Record<string, unknown>> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: TFilters;
  updateFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
}

export interface TableSortState<TSortKey extends string> {
  key: TSortKey | "";
  direction: TableSortDirection;
  onSort: (key: TSortKey) => void;
}

export interface TablePaginationState {
  pageNumber: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface TableListingControllerResult<
  TSortKey extends string,
  TFilters extends Record<string, unknown>,
> {
  queryParams: TableQueryParams<TFilters>;
  toolbar: TableToolbarState<TFilters>;
  sort: TableSortState<TSortKey>;
  pagination: TablePaginationState;
}

const normalizePageSizeOptions = (options?: number[]) => {
  const resolved = options?.filter((size) => Number.isFinite(size) && size > 0) ?? [];
  return resolved.length ? resolved : DEFAULT_PAGE_SIZE_OPTIONS;
};

export const useTableListingController = <
  TSortKey extends string,
  TFilters extends Record<string, unknown>,
>({
  initialFilters,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  initialPageSize,
  search,
}: UseTableListingControllerOptions<TFilters>): TableListingControllerResult<TSortKey, TFilters> => {
  const searchEnabled = search?.enabled ?? true;
  const searchDebounceMs = search?.debounceMs ?? 300;
  const resolvedPageSizeOptions = normalizePageSizeOptions(pageSizeOptions);
  const resolvedInitialPageSize = initialPageSize ?? resolvedPageSizeOptions[0];

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(resolvedInitialPageSize);
  const [searchValue, setSearchValue] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filters, setFilters] = useState<TFilters>(initialFilters);
  const [sortKey, setSortKey] = useState<TSortKey | "">("");
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("asc");

  useEffect(() => {
    if (!searchEnabled) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSearchKeyword(searchValue.trim());
      setPageNumber(1);
    }, searchDebounceMs);

    return () => window.clearTimeout(timer);
  }, [searchDebounceMs, searchEnabled, searchValue]);

  const handleSearchChange = useCallback(
    (value: string) => {
      if (!searchEnabled) {
        return;
      }
      setSearchValue(value);
    },
    [searchEnabled],
  );

  const updateFilter = useCallback(
    <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));
      setPageNumber(1);
    },
    [],
  );

  const onSort = useCallback(
    (key: TSortKey) => {
      if (sortKey !== "" && key === sortKey) {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
        return;
      }

      setSortKey(key);
      setSortDirection("asc");
    },
    [sortKey],
  );

  const onPageChange = useCallback((nextPageNumber: number) => {
    setPageNumber(Math.max(nextPageNumber, 1));
  }, []);

  const onPageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPageNumber(1);
  }, []);

  return {
    queryParams: {
      pageNumber,
      pageSize,
      searchKeyword: searchEnabled ? searchKeyword : "",
      filters,
    },
    toolbar: {
      searchValue,
      onSearchChange: handleSearchChange,
      filters,
      updateFilter,
    },
    sort: {
      key: sortKey,
      direction: sortDirection,
      onSort,
    },
    pagination: {
      pageNumber,
      pageSize,
      pageSizeOptions: resolvedPageSizeOptions,
      onPageChange,
      onPageSizeChange,
    },
  };
};
