import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { faculityApi } from "@/features/faculity/faculityApi";
import { ApiRoute } from "@/types/constantApiRoute";
import { faculityKeys } from "@/types/constantQueryKey";
import type { PageParams } from "@/types/sharedType";

export const useFaculityList = ({
  pageNumber,
  pageSize,
  searchKeyword,
  isActive,
}: PageParams) => {
  return useQuery({
    queryKey: faculityKeys.list(pageNumber, pageSize, searchKeyword, isActive),
    queryFn: () =>
      faculityApi.getList({
        route: ApiRoute.Faculity.List,
        pageNumber,
        pageSize,
        searchKeyword,
        isActive,
      }),
    placeholderData: keepPreviousData,
  });
};
