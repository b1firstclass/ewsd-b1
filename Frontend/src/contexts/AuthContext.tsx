import { storage } from "@/lib/utils";
import type { AuthState } from "@/types/authType";
import type { User } from "@/types/userType";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextType extends AuthState {
    login: (user: User | null, token: string, refreshToken: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = storage.getToken();
        const storedRefreshToken = storage.getRefreshToken();
        const storedUser = storage.getUser();

        if (storedToken) {
            setToken(storedToken);
            setRefreshToken(storedRefreshToken);
            //setUser(storedUser);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User | null, authToken: string, newRefreshToken: string) => {
        setUser(userData);
        setToken(authToken);
        setRefreshToken(newRefreshToken);
        setIsAuthenticated(true);
        storage.setToken(authToken);
        storage.setRefreshToken(newRefreshToken);
        storage.setUser(userData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        storage.clear();
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        storage.setUser(userData);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                isAuthenticated,
                isLoading,
                login,
                logout,
                updateUser
            }}
        >
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
