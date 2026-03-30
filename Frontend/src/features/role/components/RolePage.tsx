import { useMemo, useState } from "react";

import { DeleteDialog } from "@/components/common/DeleteDialog";
import { getErrorMessage } from "@/lib/utils";
import type { Role } from "@/types/roleType";
import type { RoleName } from "@/types/constants/roleConstants";
import { useActivePermissionList } from "../hook/useActivePermissionList";
import { useRoleDetail } from "../hook/useRoleDetail";
import { useRoleMutations } from "../hook/useRoleMutation";
import { useRoleTableController } from "../hook/useRoleTableController";
import { RoleTable } from "./RoleTable";
import { RoleFormDialog, type RoleFormValues } from "./RoleFormDialog";

export const RolePage = () => {
    const [formOpen, setFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    const { createMutation, updateMutation, deleteMutation } = useRoleMutations();
    const tableController = useRoleTableController();
    const permissionListQuery = useActivePermissionList(formOpen);
    const roleDetailQuery = useRoleDetail(editingRole?.id ?? null, formOpen && Boolean(editingRole?.id));

    const permissionOptions = permissionListQuery.data ?? [];
    const resolvedEditingRole = editingRole ? roleDetailQuery.data ?? editingRole : null;
    const isRoleLoading = Boolean(editingRole) && !roleDetailQuery.data && roleDetailQuery.isLoading;

    const permissionError = useMemo(() => {
        if (!permissionListQuery.isError || permissionOptions.length) {
            return null;
        }

        return getErrorMessage(permissionListQuery.error, "Failed to load permissions.");
    }, [permissionListQuery.error, permissionListQuery.isError, permissionOptions.length]);

    const roleLoadError = useMemo(() => {
        if (!editingRole || !roleDetailQuery.isError || roleDetailQuery.data) {
            return null;
        }

        return getErrorMessage(roleDetailQuery.error, "Failed to load role details.");
    }, [editingRole, roleDetailQuery.data, roleDetailQuery.error, roleDetailQuery.isError]);

    const resetFormMutationErrors = () => {
        createMutation.reset();
        updateMutation.reset();
    };

    const handleFormOpenChange = (open: boolean) => {
        setFormOpen(open);
        if (!open) {
            setEditingRole(null);
            resetFormMutationErrors();
        }
    };

    const openCreateDialog = () => {
        resetFormMutationErrors();
        setEditingRole(null);
        setFormOpen(true);
    };

    const openEditDialog = (item: Role) => {
        resetFormMutationErrors();
        setEditingRole(item);
        setFormOpen(true);
    };

    const openDeleteDialog = (item: Role) => {
        setDeletingRole(item);
        setDeleteOpen(true);
    };

    const handleFormSubmit = async (values: RoleFormValues) => {
        try {
            if (editingRole) {
                await updateMutation.mutateAsync({
                    id: editingRole.id,
                    request: {
                        name: values.name as RoleName,
                        description: values.description,
                        permissionIds: values.permissionIds,
                        isActive: true,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    name: values.name as RoleName,
                    description: values.description,
                    permissionIds: values.permissionIds,
                });
            }

            handleFormOpenChange(false);
        } catch {
            // Errors are surfaced inline via form mutation state in the dialog.
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingRole) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(deletingRole.id);
            setDeleteOpen(false);
            setDeletingRole(null);
        } catch {
            // Errors are handled by mutation hooks via toast.
        }
    };

    const formError = editingRole ? updateMutation.error : createMutation.error;

    return (
        <div className="space-y-6">
            <section className="space-y-1">
                <div className="space-y-1">
                    <h1 className="font-display text-2xl font-semibold">Role Management</h1>
                    {/* <p className="text-sm text-muted-foreground">
            Manage faculty records with fast server-side pagination and quick actions.
          </p> */}
                </div>
            </section>

            <RoleTable
                controller={tableController}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onCreate={openCreateDialog}
            />

            <RoleFormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                mode={editingRole ? "edit" : "create"}
                value={resolvedEditingRole}
                permissionOptions={permissionOptions}
                isPermissionsLoading={permissionListQuery.isLoading && !permissionOptions.length}
                permissionError={permissionError}
                onRetryPermissions={() => {
                    void permissionListQuery.refetch();
                }}
                isRoleLoading={isRoleLoading}
                roleLoadError={roleLoadError}
                onRetryRole={editingRole ? () => {
                    void roleDetailQuery.refetch();
                } : undefined}
                isPending={createMutation.isPending || updateMutation.isPending}
                error={formError}
                onSubmit={handleFormSubmit}
            />

            <DeleteDialog
                title="Role"
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open);
                    if (!open) {
                        setDeletingRole(null);
                    }
                }}
                isPending={deleteMutation.isPending}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};
