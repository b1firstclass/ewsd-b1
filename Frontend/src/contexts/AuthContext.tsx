import { profileQueryOptions } from "@/features/user/hooks/useUser";
import { registerAuthRefreshListener } from "@/lib/api/refreshInterceptor";
import { storage } from "@/lib/utils";
import type { AuthState } from "@/types/authType";
import type { User } from "@/types/userType";
import { useQueryClient } from "@tanstack/react-query";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

interface AuthContextType extends AuthState {
    login: (token: string, refreshToken: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setToken] = useState<string | null>(() => storage.getToken());
    const [refreshToken, setRefreshToken] = useState<string | null>(() => storage.getRefreshToken());
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(() => Boolean(storage.getToken()));

    const clearAuthState = useCallback(() => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        storage.clear();
        queryClient.removeQueries({ queryKey: profileQueryOptions.queryKey, exact: true });
    }, [queryClient]);

    const fetchAndSetProfile = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) {
            queryClient.removeQueries({ queryKey: profileQueryOptions.queryKey, exact: true });
        }

        const profile = await queryClient.fetchQuery(profileQueryOptions);
        setUser(profile);
        return profile;
    }, [queryClient]);

    const login = useCallback(async (authToken: string, newRefreshToken: string) => {
        storage.setToken(authToken);
        storage.setRefreshToken(newRefreshToken);
        setToken(authToken);
        setRefreshToken(newRefreshToken);

        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(true);

        try {
            await fetchAndSetProfile(true);
            setIsAuthenticated(true);
        } catch (error) {
            clearAuthState();
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [clearAuthState, fetchAndSetProfile]);

    const logout = useCallback(() => {
        clearAuthState();
        setIsLoading(false);
    }, [clearAuthState]);

    const updateUser = useCallback((userData: User) => {
        setUser(userData);
        queryClient.setQueryData(profileQueryOptions.queryKey, userData);
    }, [queryClient]);

    useEffect(() => {
        const unsubscribe = registerAuthRefreshListener({
            onTokensRefreshed: (token, newRefreshToken) => {
                setToken(token);
                setRefreshToken(newRefreshToken);
                setIsAuthenticated(true);
            },
            onUnauthorized: () => {
                clearAuthState();
                setIsLoading(false);
            },
        });

        return unsubscribe;
    }, [clearAuthState]);

    useEffect(() => {
        let isMounted = true;

        const bootstrapAuth = async () => {
            const storedToken = storage.getToken();
            if (!storedToken) {
                return;
            }

            try {
                await fetchAndSetProfile();
                if (!isMounted) {
                    return;
                }
                setIsAuthenticated(true);
            } catch {
                if (!isMounted) {
                    return;
                }
                clearAuthState();
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void bootstrapAuth();

        return () => {
            isMounted = false;
        };
    }, [clearAuthState, fetchAndSetProfile]);

    const authValue = useMemo<AuthContextType>(() => ({
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
    }), [
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
    ]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
