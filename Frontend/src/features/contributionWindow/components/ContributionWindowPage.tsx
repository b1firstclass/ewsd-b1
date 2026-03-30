import { useState } from "react";

import { DeleteDialog } from "@/components/common/DeleteDialog";
import type { ContributionWindowInfo } from "@/types/contributionWindowType";
import { ContributionWindowFormDialog, type ContributionWindowFormValues } from "./ContributionWindowFormDialog";
import { ContributionWindowTable } from "./ContributionWindowTable";
import { useContributionWindowMutations } from "../hooks/useContributionWindowMutations";
import { useContributionWindowTableController } from "../hooks/useContributionWindowTableController";

export const ContributionWindowPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<ContributionWindowInfo | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingWindow, setDeletingWindow] = useState<ContributionWindowInfo | null>(null);

  const { createMutation, updateMutation, deleteMutation } = useContributionWindowMutations();
  const tableController = useContributionWindowTableController();

  const resetFormMutationErrors = () => {
    createMutation.reset();
    updateMutation.reset();
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingWindow(null);
      resetFormMutationErrors();
    }
  };

  const openCreateDialog = () => {
    resetFormMutationErrors();
    setEditingWindow(null);
    setFormOpen(true);
  };

  const openEditDialog = (item: ContributionWindowInfo) => {
    resetFormMutationErrors();
    setEditingWindow(item);
    setFormOpen(true);
  };

  const openDeleteDialog = (item: ContributionWindowInfo) => {
    setDeletingWindow(item);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (values: ContributionWindowFormValues) => {
    try {
      if (editingWindow) {
        await updateMutation.mutateAsync({
          id: editingWindow.id,
          request: {
            submissionOpenDate: values.submissionOpenDate,
            submissionEndDate: values.submissionEndDate,
            closureDate: values.closureDate,
            academicYearStart: values.academicYearStart,
            academicYearEnd: values.academicYearEnd,
          },
        });
      } else {
        await createMutation.mutateAsync({
          submissionOpenDate: values.submissionOpenDate,
          submissionEndDate: values.submissionEndDate,
          closureDate: values.closureDate,
          academicYearStart: values.academicYearStart,
          academicYearEnd: values.academicYearEnd,
        });
      }

      handleFormOpenChange(false);
    } catch {
      // Errors are surfaced inline via form mutation state in the dialog.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWindow) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deletingWindow.id);
      setDeleteOpen(false);
      setDeletingWindow(null);
    } catch {
      // Errors are handled by mutation hooks via toast.
    }
  };

  const formError = editingWindow ? updateMutation.error : createMutation.error;

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold">Contribution Window Management</h1>
        </div>
      </section>

      <ContributionWindowTable
        controller={tableController}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onCreate={openCreateDialog}
      />

      <ContributionWindowFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        mode={editingWindow ? "edit" : "create"}
        value={editingWindow}
        isPending={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleFormSubmit}
      />

      <DeleteDialog
        title="Contribution window"
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeletingWindow(null);
          }
        }}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
