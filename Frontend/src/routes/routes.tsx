import { Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicRoute } from "./PublicRoute"
import { PageUrl } from "@/types/constantPageUrl"
import { LoginPage } from "@/features/auth/components/LoginPage"
import { HomePage } from "@/features/Home/components/Home"

export const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path={PageUrl.Login}
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            <Route
                path={PageUrl.Home}
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                }
            />

        </Routes>
    )
}