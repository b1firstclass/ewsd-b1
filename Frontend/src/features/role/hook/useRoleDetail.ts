import { useQuery } from "@tanstack/react-query";

import { roleKeys } from "@/types/constantQueryKey";
import { roleApi } from "../roleApi";

export const useRoleDetail = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: roleKeys.detail(id ?? "unknown"),
    queryFn: () => roleApi.getById(id!),
    enabled: enabled && Boolean(id),
  });
};
