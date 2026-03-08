import { useCallback, useMemo } from "react";

import { AppDataTable, type DataTableColumn } from "@/components/common/AppDataTable";
import { RowEditDeleteActions } from "@/components/common/RowEditDeleteActions";
import { Button } from "@/components/ui/button";
import type { User, UserSortKey } from "@/types/userType";
import { Plus } from "lucide-react";
import type { UserTableController } from "../hooks/useUserListTableController";

interface UserTableProps {
  controller: UserTableController;
  onEdit: (item: User) => void;
  onDelete: (item: User) => void;
  onCreate: () => void;
}

export const UserTable = ({
  controller,
  onEdit,
  onDelete,
  onCreate,
}: UserTableProps) => {
  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        key: "loginId",
        header: "Login ID",
        sortable: true,
        render: (item) => item.loginId,
      },
      {
        key: "fullName",
        header: "Full Name",
        sortable: true,
        render: (item) => item.fullName,
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        render: (item) => item.email,
      },
    ],
    [],
  );

  const renderRowActions = useCallback(
    (item: User) => (
      <RowEditDeleteActions
        onEdit={() => onEdit(item)}
        onDelete={() => onDelete(item)}
        editLabel={`Edit ${item.fullName}`}
        deleteLabel={`Delete ${item.fullName}`}
      />
    ),
    [onDelete, onEdit],
  );

  const handleSort = useCallback(
    (key: string) => controller.sort.onSort(key as UserSortKey),
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
            New User
          </Button>
        ),
      }}
      state={{
        loading: controller.state.isLoading,
        error: controller.state.error,
        onRetry: controller.state.onRetry,
        emptyMessage: "No users found.",
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
