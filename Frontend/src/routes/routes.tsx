import { Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicRoute } from "./PublicRoute"
import { PageUrl } from "@/types/constantPageUrl"
import { LoginPage } from "@/features/auth/components/LoginPage"
import { HomePage } from "@/features/Home/components/Home"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { FaculityPage } from "@/features/faculity/components/FaculityPage"
import { RolePage } from "@/features/role/components/RolePage"
import { UserListPage } from "@/features/user/component/UserListPage"
import { ContributionWindowPage } from "@/features/contributionWindow/components/ContributionWindowPage"

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
                element={
                    <ProtectedRoute>
                        <ProtectedLayout />
                    </ProtectedRoute>
                }
            >
                <Route path={PageUrl.Home} element={<HomePage />} />
                <Route path={PageUrl.ContributionWindow} element={<ContributionWindowPage />} />
                <Route path={PageUrl.Role} element={<RolePage />} />
                <Route path={PageUrl.Faculity} element={<FaculityPage />} />
                <Route path={PageUrl.User} element={<UserListPage />} />
            </Route>

        </Routes>
    )
}
