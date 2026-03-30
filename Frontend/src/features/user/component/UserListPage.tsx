import { useMemo, useState } from "react";

import { DeleteDialog } from "@/components/common/DeleteDialog";
import { getErrorMessage } from "@/lib/utils";
import type { User } from "@/types/userType";
import { useFaculityList } from "@/features/faculity/hooks/useFaculityList";
import { useRoleList } from "@/features/role/hook/useRoleList";
import { useUserDetail, useUserMutations } from "../hooks/useUser";
import { useUserTableController } from "../hooks/useUserListTableController";
import { UserFormDialog, type UserFormValues } from "./UserFormDialog";
import { UserTable } from "./UserTable";

const RELATION_PAGE_SIZE = 100;

export const UserListPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { createMutation, updateMutation, deleteMutation } = useUserMutations();
  const tableController = useUserTableController();
  const userDetailQuery = useUserDetail(editingUser?.id ?? null, formOpen && Boolean(editingUser?.id));

  const faculityListQuery = useFaculityList({
    pageNumber: 1,
    pageSize: RELATION_PAGE_SIZE,
    searchKeyword: "",
  });

  const roleListQuery = useRoleList({
    pageNumber: 1,
    pageSize: RELATION_PAGE_SIZE,
    searchKeyword: "",
  });

  const faculityOptions = faculityListQuery.data?.items ?? [];
  const roleOptions = roleListQuery.data?.items ?? [];
  const resolvedEditingUser = editingUser ? userDetailQuery.data ?? editingUser : null;
  const isUserLoading = Boolean(editingUser) && !userDetailQuery.data && userDetailQuery.isLoading;

  const relationOptionsError = useMemo(() => {
    if (faculityListQuery.isError) {
      return getErrorMessage(faculityListQuery.error, "Failed to load faculties.");
    }

    if (roleListQuery.isError) {
      return getErrorMessage(roleListQuery.error, "Failed to load roles.");
    }

    return null;
  }, [faculityListQuery.error, faculityListQuery.isError, roleListQuery.error, roleListQuery.isError]);

  const userLoadError = useMemo(() => {
    if (!editingUser || !userDetailQuery.isError || userDetailQuery.data) {
      return null;
    }

    return getErrorMessage(userDetailQuery.error, "Failed to load user details.");
  }, [editingUser, userDetailQuery.data, userDetailQuery.error, userDetailQuery.isError]);

  const isOptionsLoading =
    (faculityListQuery.isLoading && !faculityOptions.length) ||
    (roleListQuery.isLoading && !roleOptions.length);

  const resetFormMutationErrors = () => {
    createMutation.reset();
    updateMutation.reset();
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingUser(null);
      resetFormMutationErrors();
    }
  };

  const openCreateDialog = () => {
    resetFormMutationErrors();
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEditDialog = (item: User) => {
    resetFormMutationErrors();
    setEditingUser(item);
    setFormOpen(true);
  };

  const openDeleteDialog = (item: User) => {
    setDeletingUser(item);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser.id,
          request: {
            loginId: values.loginId,
            fullName: values.fullName,
            email: values.email,
            facultyIds: values.facultyIds,
            roleId: values.roleId,
            isActive: editingUser.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          loginId: values.loginId,
          fullName: values.fullName,
          email: values.email,
          password: values.password ?? "",
          facultyIds: values.facultyIds,
          roleId: values.roleId,
        });
      }

      handleFormOpenChange(false);
    } catch {
      // Errors are surfaced inline via form mutation state in the dialog.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      setDeleteOpen(false);
      setDeletingUser(null);
    } catch {
      // Errors are handled by mutation hooks via toast.
    }
  };

  const formError = editingUser ? updateMutation.error : createMutation.error;

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold">User Management</h1>
        </div>
      </section>

      <UserTable
        controller={tableController}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onCreate={openCreateDialog}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        mode={editingUser ? "edit" : "create"}
        value={resolvedEditingUser}
        faculityOptions={faculityOptions}
        roleOptions={roleOptions}
        isOptionsLoading={isOptionsLoading}
        optionsError={relationOptionsError}
        isUserLoading={isUserLoading}
        userLoadError={userLoadError}
        onRetryUser={
          editingUser
            ? () => {
                void userDetailQuery.refetch();
              }
            : undefined
        }
        isPending={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={handleFormSubmit}
      />

      <DeleteDialog
        title="User"
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeletingUser(null);
          }
        }}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
