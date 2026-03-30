import { getErrorMessage } from "@/lib/utils";
import { userKeys } from "@/types/constantQueryKey";
import type { User, UserCreateRequest, UserUpdateRequest } from "@/types/userType";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi } from "../userApi";

export const profileQueryOptions = queryOptions<User>({
    queryKey: [userKeys.profile],
    queryFn: () => userApi.getUserProfile(),
});

export const useUserProfile = () => {
    return useQuery(profileQueryOptions);
};

export const useUserDetail = (id: string | null, enabled = true) => {
    return useQuery({
        queryKey: userKeys.detail(id ?? "unknown"),
        queryFn: () => userApi.getById(id!),
        enabled: enabled && Boolean(id),
    });
};

export const useUserMutations = () => {
    const queryClient = useQueryClient();

    const invalidateList = () =>
        queryClient.invalidateQueries({
            queryKey: userKeys.all,
        });

    const createMutation = useMutation({
        mutationFn: (request: UserCreateRequest) => userApi.create(request),
        onSuccess: () => {
            toast.success("User created successfully.");
            void invalidateList();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, request }: { id: string; request: UserUpdateRequest }) =>
            userApi.update(id, request),
        onSuccess: () => {
            toast.success("User updated successfully.");
            void invalidateList();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => userApi.delete(id),
        onSuccess: () => {
            toast.success("User deleted successfully.");
            void invalidateList();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to delete user."));
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};
