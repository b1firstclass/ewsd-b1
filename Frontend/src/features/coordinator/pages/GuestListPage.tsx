import { useMemo, useCallback } from "react";
import { AppDataTable, type DataTableColumn } from "@/components/common/AppDataTable";
import { Badge } from "@/components/ui/badge";
import type { User, UserSortKey } from "@/types/userType";
import { useGuestListTableController } from "../hooks/useGuestListTableController";

export const GuestListPage = () => {
  const controller = useGuestListTableController();

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        key: "fullName",
        header: "Full Name",
        sortable: true,
        render: (item) => (
          <span className="font-medium text-foreground">{item.fullName}</span>
        ),
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        render: (item) => item.email,
      },
      {
        key: "loginId",
        header: "Login ID",
        sortable: true,
        render: (item) => item.loginId,
      },
      {
        key: "faculties",
        header: "Faculty",
        render: (item) =>
          item.faculties?.map((f) => f.name).join(", ") || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (item) => (
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const handleSort = useCallback(
    (key: string) => controller.sort.onSort(key as UserSortKey),
    [controller.sort],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Guest List
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View registered guest users within your faculty.
        </p>
      </div>

      <AppDataTable
        content={{
          items: controller.items,
          rowKey: "id",
          columns,
        }}
        toolbar={{
          search: {
            value: controller.toolbar.searchValue,
            onChange: controller.toolbar.onSearchChange,
            placeholder: "Search guests...",
          },
        }}
        state={{
          loading: controller.state.isLoading,
          error: controller.state.error,
          onRetry: controller.state.onRetry,
          emptyMessage: "No guest users found in your faculty.",
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
    </div>
  );
};
