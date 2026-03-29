import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/query/queryClient"
import { AuthProvider } from "./contexts/AuthContext"
import { AppRouter } from "./router/tanstackRouter"
import "@/lib/api/refreshInterceptor"
import "@/styles/theme.css"
import { Toaster } from "@/components/ui/sonner"


function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
