export const ApiRoute = {
    Auth: {
        Login: "/users/login",
        RefreshToken: "/users/refresh-token"
    },
    User: {
        profile: "/users/profile"
    },
    Faculity: {
        List: "/Faculties",
        GetById: (id: string) => `/Faculties/${id}`,
        Create: "/Faculties",
        Update: (id: string) => `/Faculties/${id}`,
        Delete: (id: string) => `/Faculties/${id}`,
    }
}