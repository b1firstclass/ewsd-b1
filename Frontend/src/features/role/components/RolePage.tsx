import { useState } from "react";

import { DeleteDialog } from "@/components/common/DeleteDialog";
import type { Role } from "@/types/roleType";
import { useRoleMutations } from "../hook/useRoleMutation";
import { useRoleTableController } from "../hook/useRoleTableController";
import { RoleTable } from "./RoleTable";
import { RoleFormDialog } from "./RoleFormDialog";

export const RolePage = () => {
    const [formOpen, setFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    const { createMutation, updateMutation, deleteMutation } = useRoleMutations();
    const tableController = useRoleTableController();

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

    const handleFormSubmit = async (values: { name: string; description: string }) => {
        try {
            if (editingRole) {
                await updateMutation.mutateAsync({
                    id: editingRole.id,
                    request: {
                        name: values.name,
                        description: values.description,
                        isActive: true,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    name: values.name,
                    description: values.description,
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
                value={editingRole}
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
