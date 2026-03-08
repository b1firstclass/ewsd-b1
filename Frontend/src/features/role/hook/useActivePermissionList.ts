import { useQuery } from "@tanstack/react-query";

import { permissionKeys } from "@/types/constantQueryKey";
import { permissionApi } from "../permissionApi";

const PERMISSION_LIST_STALE_TIME = 5 * 60 * 1000;

export const useActivePermissionList = (enabled = true) => {
  return useQuery({
    queryKey: permissionKeys.activeList,
    queryFn: () => permissionApi.getActiveList(),
    enabled,
    staleTime: PERMISSION_LIST_STALE_TIME,
  });
};
