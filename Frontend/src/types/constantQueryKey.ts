
export const faculityKeys = {
  all: ["faculity"] as const,
  list: (
    pageNumber: number,
    pageSize: number,
    searchKeyword: string,
    isActive?: boolean,
  ) =>
    [
      ...faculityKeys.all,
      "list",
      pageNumber,
      pageSize,
      searchKeyword,
      isActive ?? "all",
    ] as const,
};

export const userKeys = {
  all: ["users"] as const,
  list: (
    pageNumber: number,
    pageSize: number,
    searchKeyword: string,
    isActive?: boolean,
  ) =>
    [
      ...userKeys.all,
      "list",
      pageNumber,
      pageSize,
      searchKeyword,
      isActive ?? "all",
    ] as const,
  profile: "user-profile",
}

export const roleKeys = {
  all: ["roles"] as const,
  list: (
    pageNumber: number,
    pageSize: number,
    searchKeyword: string,
    isActive?: boolean,
  ) =>
    [
      ...roleKeys.all,
      "list",
      pageNumber,
      pageSize,
      searchKeyword,
      isActive ?? "all",
    ] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export const permissionKeys = {
  all: ["permissions"] as const,
  activeList: ["permissions", "active-list"] as const,
};

