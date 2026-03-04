import { UserQueryKey } from "@/types/constantQueryKey";
import type { User } from "@/types/userType"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { userApi } from "../userApi";

export const profileQueryOptions = queryOptions<User>({
    queryKey: [UserQueryKey.profile],
    queryFn: () => userApi.getUserProfile(),
});

export const useUserProfile = () => {
    return useQuery(profileQueryOptions);
};
