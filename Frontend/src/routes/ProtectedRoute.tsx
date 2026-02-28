import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/AuthContext"
import { PageUrl } from "@/types/constantPageUrl";
import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  console.log('Is Authenticated => ', isAuthenticated);

  if(isLoading){
     return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // Show loading while checking authentication
  if (typeof isAuthenticated === "undefined") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log("Login redirect...")
    return <Navigate to={PageUrl.Login} replace />
  }

  return <>{children}</>
}
