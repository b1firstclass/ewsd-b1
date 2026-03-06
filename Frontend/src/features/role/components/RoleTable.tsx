import type { Role, RoleSortKey } from "@/types/roleType";
import type { RoleTableController } from "../hook/useRoleTableController";
import { AppDataTable, type DataTableColumn } from "@/components/common/AppDataTable";
import { useCallback, useMemo } from "react";
import { RowEditDeleteActions } from "@/components/common/RowEditDeleteActions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RoleTableProps {
    controller: RoleTableController;
    onEdit: (item: Role) => void;
    onDelete: (item: Role) => void;
    onCreate: () => void;
}

export const RoleTable = ({
    controller,
    onEdit,
    onDelete,
    onCreate,
}: RoleTableProps) => {
    const columns = useMemo<DataTableColumn<Role>[]>(
        () => [
            {
                key: "name",
                header: "Name",
                sortable: true,
                render: (item) => item.name,
            },
            {
                key: "description",
                header: "Description",
                sortable: true,
                render: (item) => item.description,
            }
        ],
        [],
    );

    const renderRowActions = useCallback(
        (item: Role) => (
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
        (key: string) => controller.sort.onSort(key as RoleSortKey),
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
                        New Role
                    </Button>
                ),
            }}
            state={{
                loading: controller.state.isLoading,
                error: controller.state.error,
                onRetry: controller.state.onRetry,
                emptyMessage: "No roles found.",
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
