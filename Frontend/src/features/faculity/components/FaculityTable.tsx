import { useCallback, useMemo } from "react";

import { AppDataTable, type DataTableColumn } from "@/components/common/AppDataTable";
import { RowEditDeleteActions } from "@/components/common/RowEditDeleteActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Faculity, FaculitySortKey } from "@/types/faculityType";
import { Plus } from "lucide-react";
import type { FaculityTableController } from "../hooks/useFaculityTableController";

interface FaculityTableProps {
  controller: FaculityTableController;
  onEdit: (item: Faculity) => void;
  onDelete: (item: Faculity) => void;
  onCreate: () => void;
}

export const FaculityTable = ({
  controller,
  onEdit,
  onDelete,
  onCreate,
}: FaculityTableProps) => {
  const columns = useMemo<DataTableColumn<Faculity>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        render: (item) => item.name,
      },
      {
        key: "status",
        header: "Status",
        render: (item) => (
          <Badge
            variant={item.isActive ? "secondary" : "outline"}
            className="rounded-full"
          >
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      }
    ],
    [],
  );

  const renderRowActions = useCallback(
    (item: Faculity) => (
      <RowEditDeleteActions
        onEdit={() => onEdit(item)}
        onDelete={() => onDelete(item)}
        editLabel={`Edit ${item.name}`}
        deleteLabel={`Delete ${item.name}`}
      />
    ),
    [onDelete, onEdit],
  );

  const handleSort = useCallback(
    (key: string) => controller.sort.onSort(key as FaculitySortKey),
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
          placeholder: "Search...",
        },
        actionSlot: (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New Faculty
          </Button>
        ),
      }}
      state={{
        loading: controller.state.isLoading,
        error: controller.state.error,
        onRetry: controller.state.onRetry,
        emptyMessage: "No faculties found.",
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
