const getActionsRoute = (mainRoute: string): ActionProperties => {
    return {
        List: mainRoute,
        GetById: (id: string) => mainRoute + `/${id}`,
        Create: mainRoute,
        Update: (id: string) => mainRoute + `/${id}`,
        Delete: (id: string) => mainRoute + `/${id}`,
    };
};

export const ApiRoute = {
    Auth: {
        Login: "/users/login",
        RefreshToken: "/users/refresh-token"
    },
    Role: getActionsRoute("/roles"),
    User: {
        profile: "/users/profile",
        ...getActionsRoute("/users"),
    },
    Faculity: getActionsRoute("/faculties"),
    Permission: {
        getActiveList: "/permissions/activePermissions"
    },
    ContributionWindow: {
        getStatus: "/ContributionWindows/status",
        ...getActionsRoute("/ContributionWindows"),
    },
    Contribution: {
        getSelectedList: "/Contributions/selected",
        downloadSelected: (id: string) => `/Contributions/selected/${id}/download`,
        downloadSelectedList: "/Contributions/selected/download",
        submit: (id: string) => `/Contributions/${id}/submit`,
        review: (id: string) => `/Contributions/${id}/review`,
        approve: (id: string) => `/Contributions/${id}/approve`,
        select: (id: string) => `/Contributions/${id}/select`,
        selectList: "/Contributions/select",
        reject: (id: string) => `/api/Contributions/${id}/reject`,
        requestRevision: (id: string) => `/Contributions/${id}/request-revision`,
        ...getActionsRoute("/Contributions"),
    },
    Comment: {
        getByContributionId: (contributionId: string) => `/Comments/contribution/${contributionId}`,
        ...getActionsRoute("Comments"),
    }
}

interface ActionProperties {
    List: string;
    GetById: (id: string) => string;
    Create: string;
    Update: (id: string) => string;
    Delete: (id: string) => string;
}

