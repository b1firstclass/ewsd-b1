import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/utils";
import { contributionWindowKeys } from "@/types/constantQueryKey";
import type {
  ContributionWindowCreateRequest,
  ContributionWindowUpdateRequest,
} from "@/types/contributionWindowType";
import { contributionWindowApi } from "../contributionWindowApi";

export const useContributionWindowMutations = () => {
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: contributionWindowKeys.all,
    });

  const createMutation = useMutation({
    mutationFn: (request: ContributionWindowCreateRequest) => contributionWindowApi.create(request),
    onSuccess: () => {
      toast.success("Contribution window created successfully.");
      void invalidateList();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: ContributionWindowUpdateRequest }) =>
      contributionWindowApi.update(id, request),
    onSuccess: () => {
      toast.success("Contribution window updated successfully.");
      void invalidateList();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contributionWindowApi.delete(id),
    onSuccess: () => {
      toast.success("Contribution window deleted successfully.");
      void invalidateList();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete contribution window."));
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
