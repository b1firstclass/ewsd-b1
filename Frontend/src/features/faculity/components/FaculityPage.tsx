import { useState } from "react";

import type { Faculity } from "@/types/faculityType";
import { FaculityFormDialog } from "./FaculityFormDialog";
import { FaculityTable } from "./FaculityTable";
import { useFaculityTableController } from "../hooks/useFaculityTableController";
import { useFaculityMutations } from "../hooks/useFaculityMutations";
import { DeleteDialog } from "@/components/common/DeleteDialog";

export const FaculityPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingFaculity, setEditingFaculity] = useState<Faculity | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingFaculity, setDeletingFaculity] = useState<Faculity | null>(null);

  const { createMutation, updateMutation, deleteMutation } = useFaculityMutations();
  const tableController = useFaculityTableController();

  const resetFormMutationErrors = () => {
    createMutation.reset();
    updateMutation.reset();
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingFaculity(null);
      resetFormMutationErrors();
    }
  };

  const openCreateDialog = () => {
    resetFormMutationErrors();
    setEditingFaculity(null);
    setFormOpen(true);
  };

  const openEditDialog = (item: Faculity) => {
    resetFormMutationErrors();
    setEditingFaculity(item);
    setFormOpen(true);
  };

  const openDeleteDialog = (item: Faculity) => {
    setDeletingFaculity(item);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (values: { name: string; isActive: boolean }) => {
    try {
      if (editingFaculity) {
        await updateMutation.mutateAsync({
          id: editingFaculity.id,
          request: {
            name: values.name,
            isActive: values.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
        });
      }

      handleFormOpenChange(false);
    } catch {
      // Errors are surfaced inline via form mutation state in the dialog.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFaculity) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deletingFaculity.id);
      setDeleteOpen(false);
      setDeletingFaculity(null);
    } catch {
      // Errors are handled by mutation hooks via toast.
    }
  };

  const formError = editingFaculity ? updateMutation.error : createMutation.error;

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold">Faculty Management</h1>
          {/* <p className="text-sm text-muted-foreground">
            Manage faculty records with fast server-side pagination and quick actions.
          </p> */}
        </div>
      </section>

      <FaculityTable
        controller={tableController}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onCreate={openCreateDialog}
      />

      <FaculityFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        mode={editingFaculity ? "edit" : "create"}
        value={editingFaculity}
        isPending={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleFormSubmit}
      />

      <DeleteDialog
        title="Faculty"
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeletingFaculity(null);
          }
        }}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
