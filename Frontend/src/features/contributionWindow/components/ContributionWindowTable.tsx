import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";

import { AppDataTable, type DataTableColumn } from "@/components/common/AppDataTable";
import { RowEditDeleteActions } from "@/components/common/RowEditDeleteActions";
import { Button } from "@/components/ui/button";
import type {
  ContributionWindowInfo,
  ContributionWindowSortKey,
} from "@/types/contributionWindowType";
import type { ContributionWindowTableController } from "../hooks/useContributionWindowTableController";

interface ContributionWindowTableProps {
  controller: ContributionWindowTableController;
  onEdit: (item: ContributionWindowInfo) => void;
  onDelete: (item: ContributionWindowInfo) => void;
  onCreate: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const normalizeDateValue = (value?: string) => value?.slice(0, 10) ?? "";

const formatDateLabel = (value?: string) => {
  const normalizedDate = normalizeDateValue(value);
  if (!normalizedDate) {
    return "N/A";
  }

  const parsedDate = new Date(`${normalizedDate}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedDate;
  }

  return dateFormatter.format(parsedDate);
};

export const ContributionWindowTable = ({
  controller,
  onEdit,
  onDelete,
  onCreate,
}: ContributionWindowTableProps) => {
  const columns = useMemo<DataTableColumn<ContributionWindowInfo>[]>(
    () => [
      {
        key: "academicYearStart",
        header: "Academic Year",
        mobileLabel: "Academic year",
        sortable: true,
        render: (item) => `${item.academicYearStart} - ${item.academicYearEnd}`,
      },
      {
        key: "submissionOpenDate",
        header: "Submission Window",
        mobileLabel: "Submission",
        sortable: true,
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {formatDateLabel(item.submissionOpenDate)}
            </span>
            <span className="text-sm text-muted-foreground">
              to {formatDateLabel(item.submissionEndDate)}
            </span>
          </div>
        ),
      },
      {
        key: "closureDate",
        header: "Closure Date",
        mobileLabel: "Closure",
        sortable: true,
        render: (item) => formatDateLabel(item.closureDate),
      },
    ],
    [],
  );

  const renderRowActions = useCallback(
    (item: ContributionWindowInfo) => (
      <RowEditDeleteActions
        onEdit={() => onEdit(item)}
        onDelete={() => onDelete(item)}
        editLabel={`Edit contribution window ${item.academicYearStart}-${item.academicYearEnd}`}
        deleteLabel={`Delete contribution window ${item.academicYearStart}-${item.academicYearEnd}`}
      />
    ),
    [onDelete, onEdit],
  );

  const handleSort = useCallback(
    (key: string) => controller.sort.onSort(key as ContributionWindowSortKey),
    [controller.sort],
  );

  return (
    <AppDataTable
      content={{
        items: controller.items,
        rowKey: "id",
        columns,
        rowActions: renderRowActions,
      }}
      toolbar={{
        search: {
          value: controller.toolbar.searchValue,
          onChange: controller.toolbar.onSearchChange,
          placeholder: "Search academic year...",
        },
        actionSlot: (
          <Button type="button" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New Window
          </Button>
        ),
      }}
      state={{
        loading: controller.state.isLoading,
        error: controller.state.error,
        onRetry: controller.state.onRetry,
        emptyMessage: "No contribution windows found.",
      }}
      sort={{
        key: controller.sort.key,
        direction: controller.sort.direction,
        onSort: handleSort,
      }}
      pagination={{
        pageNumber: controller.pagination.pageNumber,
        pageSize: controller.pagination.pageSize,
        totalCount: controller.pagination.totalCount,
        totalPages: controller.pagination.totalPages,
        pageSizeOptions: controller.pagination.pageSizeOptions,
        onPageChange: controller.pagination.onPageChange,
        onPageSizeChange: controller.pagination.onPageSizeChange,
        isFetching: controller.pagination.isFetching,
      }}
    />
  );
};
