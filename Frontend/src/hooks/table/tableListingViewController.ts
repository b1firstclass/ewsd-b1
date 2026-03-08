import type { TableMappedListResult, TableRequestState } from "./mapTableListResult";
import type {
  TableListingControllerResult,
  TableSortDirection,
} from "./useTableListingController";


export const PAGE_SIZE_OPTIONS = [5,10, 20, 50];

export interface TableListingToolbarViewState {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export interface TableListingSortViewState<TSortKey extends string> {
  key: TSortKey | "";
  direction: TableSortDirection;
  onSort: (key: TSortKey) => void;
}

export interface TableListingPaginationViewState {
  pageNumber: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalCount: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface TableListingViewController<TItem, TSortKey extends string> {
  items: TItem[];
  toolbar: TableListingToolbarViewState;
  sort: TableListingSortViewState<TSortKey>;
  pagination: TableListingPaginationViewState;
  state: TableRequestState;
}

interface CreateTableListingViewControllerOptions<
  TItem,
  TSortKey extends string,
  TFilters extends Record<string, unknown>,
> {
  items: TItem[];
  baseController: TableListingControllerResult<TSortKey, TFilters>;
  mappedResult: Pick<TableMappedListResult<TItem>, "totalCount" | "totalPages" | "state">;
}

export const createTableListingViewController = <
  TItem,
  TSortKey extends string,
  TFilters extends Record<string, unknown>,
>({
  items,
  baseController,
  mappedResult,
}: CreateTableListingViewControllerOptions<TItem, TSortKey, TFilters>): TableListingViewController<
  TItem,
  TSortKey
> => {
  return {
    items,
    toolbar: {
      searchValue: baseController.toolbar.searchValue,
      onSearchChange: baseController.toolbar.onSearchChange,
    },
    sort: {
      key: baseController.sort.key,
      direction: baseController.sort.direction,
      onSort: baseController.sort.onSort,
    },
    pagination: {
      pageNumber: baseController.pagination.pageNumber,
      pageSize: baseController.pagination.pageSize,
      pageSizeOptions: baseController.pagination.pageSizeOptions,
      totalCount: mappedResult.totalCount,
      totalPages: mappedResult.totalPages,
      isFetching: mappedResult.state.isFetching,
      onPageChange: baseController.pagination.onPageChange,
      onPageSizeChange: baseController.pagination.onPageSizeChange,
    },
    state: mappedResult.state,
  };
};
