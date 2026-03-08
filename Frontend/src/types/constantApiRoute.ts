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
    }
}

interface ActionProperties {
    List: string;
    GetById: (id: string) => string;
    Create: string;
    Update: (id: string) => string;
    Delete: (id: string) => string;
}

