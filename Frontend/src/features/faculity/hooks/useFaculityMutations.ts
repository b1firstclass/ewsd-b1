import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/sonner";
import { faculityApi } from "@/features/faculity/faculityApi";
import { getErrorMessage } from "@/lib/utils";
import type { FaculityCreateRequest, FaculityUpdateRequest } from "@/types/faculityType";
import { faculityKeys } from "@/types/constantQueryKey";

export const useFaculityMutations = () => {
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: faculityKeys.all,
    });

  const createMutation = useMutation({
    mutationFn: (request: FaculityCreateRequest) => faculityApi.create(request),
    onSuccess: () => {
      toast.success("Faculty created successfully.");
      void invalidateList();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: FaculityUpdateRequest }) =>
      faculityApi.update(id, request),
    onSuccess: () => {
      toast.success("Faculty updated successfully.");
      void invalidateList();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faculityApi.delete(id),
    onSuccess: () => {
      toast.success("Faculty deleted successfully.");
      void invalidateList();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete faculty."));
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
