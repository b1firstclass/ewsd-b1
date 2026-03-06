import { useId, type Key, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw, Search } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  mobileLabel?: ReactNode;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTablePagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isFetching?: boolean;
}

export interface DataTableSort {
  key: string;
  direction: "asc" | "desc";
  onSort: (key: string) => void;
}

export interface DataTableSearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface DataTableToolbar {
  search?: DataTableSearchConfig;
  filterSlot?: ReactNode;
  actionSlot?: ReactNode;
}

export interface DataTableState {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
}

export interface DataTableContent<T> {
  items: T[];
  rowKey: keyof T | ((row: T) => Key);
  columns: DataTableColumn<T>[];
  rowActions?: (row: T) => ReactNode;
  rowActionsLabel?: ReactNode;
}

export interface AppDataTableProps<T> {
  content: DataTableContent<T>;
  toolbar?: DataTableToolbar;
  state?: DataTableState;
  pagination?: DataTablePagination;
  sort?: DataTableSort;
  className?: string;
}

const buildPageItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages] as const;
};

const getSortIcon = (sort: DataTableSort, key: string) => {
  if (sort.key !== key) {
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  }

  return sort.direction === "asc" ? (
    <ArrowUp className="h-4 w-4 text-primary" />
  ) : (
    <ArrowDown className="h-4 w-4 text-primary" />
  );
};

export function AppDataTable<T>({
  content,
  toolbar,
  state,
  pagination,
  sort,
  className,
}: AppDataTableProps<T>) {
  const pageSizeSelectId = useId();

  const {
    items,
    rowKey,
    columns,
    rowActions,
    rowActionsLabel = "Actions",
  } = content;
  const loading = state?.loading ?? false;
  const error = state?.error;
  const onRetry = state?.onRetry;
  const emptyMessage = state?.emptyMessage ?? "No records found.";
  const hasPagination = Boolean(pagination);
  const hasPageSizeOptions = hasPagination && Boolean(pagination?.pageSizeOptions?.length);
  const search = toolbar?.search;
  const showHeader = Boolean(search || toolbar?.filterSlot || toolbar?.actionSlot || hasPageSizeOptions);
  const safeTotalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const currentPage = pagination?.pageNumber ?? 1;
  const pageItems = buildPageItems(currentPage, safeTotalPages);

  const resolveRowKey = (row: T, index: number) =>
    typeof rowKey === "function" ? rowKey(row) : ((row[rowKey] as Key | null | undefined) ?? index);

  const getCardLabel = (column: DataTableColumn<T>): ReactNode => {
    if (column.mobileLabel !== undefined) {
      return column.mobileLabel;
    }

    if (typeof column.header === "string" || typeof column.header === "number") {
      return column.header;
    }

    return column.key;
  };

  const fromRecord =
    pagination && pagination.totalCount
      ? (pagination.pageNumber - 1) * pagination.pageSize + 1
      : 0;
  const toRecord =
    pagination && pagination.totalCount
      ? Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)
      : 0;

  return (
    <Card className={cn("rounded-2xl", className)}>
      {showHeader ? (
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {search ? (
              <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search.value}
                  onChange={(event) => search.onChange(event.target.value)}
                  placeholder={search.placeholder ?? "Search..."}
                  className="pl-9"
                />
              </div>
            ) : null}

            {toolbar?.filterSlot}

            {hasPageSizeOptions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Label htmlFor={pageSizeSelectId} className="text-muted-foreground">
                  Rows
                </Label>
                <NativeSelect
                  id={pageSizeSelectId}
                  value={String(pagination!.pageSize)}
                  onChange={(event) => pagination!.onPageSizeChange(Number(event.target.value))}
                  className="min-w-[6.75rem]"
                  aria-label="Rows per page"
                  disabled={pagination!.isFetching}
                >
                  {pagination!.pageSizeOptions?.map((size) => (
                    <NativeSelectOption key={size} value={String(size)}>
                      {size} / page
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            ) : null}

            {toolbar?.actionSlot ? (
              <div className="ml-auto flex items-center gap-2">{toolbar.actionSlot}</div>
            ) : null}
          </div>
        </CardHeader>
      ) : null}

      <CardContent className="space-y-4">
        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <span>{error}</span>
            {onRetry ? (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner label="Loading table data" />
          </div>
        ) : (
          <>
            <div className="hidden min-[450px]:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key} className={column.headerClassName}>
                        {sort && column.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-left transition-colors hover:text-foreground"
                            onClick={() => sort.onSort(column.key)}
                          >
                            {column.header}
                            {getSortIcon(sort, column.key)}
                          </button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    ))}
                    {rowActions ? (
                      <TableHead className="w-28 text-right">{rowActionsLabel}</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length ? (
                    items.map((row, index) => (
                      <TableRow key={resolveRowKey(row, index)}>
                        {columns.map((column) => (
                          <TableCell key={column.key} className={column.cellClassName}>
                            {column.render(row)}
                          </TableCell>
                        ))}
                        {rowActions ? (
                          <TableCell className="text-right">{rowActions(row)}</TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (rowActions ? 1 : 0)}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 min-[450px]:hidden">
              {items.length ? (
                items.map((row, index) => (
                  <article
                    key={resolveRowKey(row, index)}
                    className="rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/80 p-4 shadow-sm shadow-black/5"
                  >
                    <div className="space-y-2">
                      {columns.map((column, columnIndex) => (
                        <div
                          key={column.key}
                          className={cn(
                            "flex items-start justify-between gap-3",
                            columnIndex === 0 && "border-b border-border/70 pb-2",
                          )}
                        >
                          <span className="text-sm text-muted-foreground">{getCardLabel(column)}</span>
                          <div
                            className={cn(
                              "text-right text-sm font-medium text-foreground",
                              columnIndex === 0 && "text-base font-semibold",
                            )}
                          >
                            {column.render(row)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {rowActions ? (
                      <div className="mt-4 border-t border-border/70 pt-3">{rowActions(row)}</div>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground shadow-sm shadow-black/5">
                  {emptyMessage}
                </div>
              )}
            </div>

            {pagination ? (
              <div className="flex flex-col gap-3 pt-2 min-[450px]:flex-row min-[450px]:items-center min-[450px]:justify-between">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground min-[450px]:justify-start">
                  <span>
                    Showing {fromRecord}-{toRecord} of {pagination.totalCount} result(s)
                  </span>
                  {pagination.isFetching ? (
                    <Badge variant="secondary" className="rounded-full">
                      Updating...
                    </Badge>
                  ) : null}
                </div>

                <Pagination className="mx-0 w-full justify-center min-[450px]:w-auto min-[450px]:justify-end">
                  <PaginationContent className="items-center gap-1.5 sm:gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => pagination.onPageChange(Math.max(pagination.pageNumber - 1, 1))}
                        disabled={pagination.pageNumber <= 1 || pagination.isFetching}
                        className="h-9 w-9 gap-0 rounded-full border border-input bg-background p-0 text-foreground shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 [&_span]:hidden"
                      />
                    </PaginationItem>

                    {pageItems.map((item, index) => (
                      <PaginationItem key={`${item}-${index}`}>
                        {item === "ellipsis" ? (
                          <PaginationEllipsis className="h-9 w-9 rounded-full border border-border text-muted-foreground" />
                        ) : (
                          <PaginationLink
                            isActive={pagination.pageNumber === item}
                            onClick={() => pagination.onPageChange(item)}
                            disabled={pagination.isFetching}
                            className={cn(
                              "h-9 w-9 rounded-full text-sm font-semibold shadow-none transition-colors",
                              pagination.pageNumber === item
                                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                : "border-border bg-background text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => pagination.onPageChange(Math.min(pagination.pageNumber + 1, safeTotalPages))}
                        disabled={pagination.pageNumber >= safeTotalPages || pagination.isFetching}
                        className="h-9 w-9 gap-0 rounded-full border border-input bg-background p-0 text-foreground shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 [&_span]:hidden"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
