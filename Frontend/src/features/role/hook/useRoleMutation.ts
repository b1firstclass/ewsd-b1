import { roleKeys } from "@/types/constantQueryKey";
import type { RoleCreateRequest, RoleUpdateRequest } from "@/types/roleType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roleApi } from "../roleApi";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const useRoleMutations = () => {
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: roleKeys.all,
    });

  const createMutation = useMutation({
    mutationFn: (request: RoleCreateRequest) => roleApi.create(request),
    onSuccess: () => {
      toast.success("Role created successfully.");
      void invalidateList();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: RoleUpdateRequest }) =>
      roleApi.update(id, request),
    onSuccess: () => {
      toast.success("Role updated successfully.");
      void invalidateList();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      toast.success("Role deleted successfully.");
      void invalidateList();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete role."));
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
