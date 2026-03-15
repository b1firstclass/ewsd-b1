import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ApiRoute } from "@/types/constantApiRoute";
import { contributionWindowKeys } from "@/types/constantQueryKey";
import type { PageParams } from "@/types/sharedType";
import { contributionWindowApi } from "../contributionWindowApi";

export const useContributionWindowList = ({
  pageNumber,
  pageSize,
  searchKeyword,
  isActive,
}: PageParams) => {
  return useQuery({
    queryKey: contributionWindowKeys.list(pageNumber, pageSize, searchKeyword, isActive),
    queryFn: () =>
      contributionWindowApi.getList({
        route: ApiRoute.ContributionWindow.List,
        pageNumber,
        pageSize,
        searchKeyword,
        isActive,
      }),
    placeholderData: keepPreviousData,
  });
};
