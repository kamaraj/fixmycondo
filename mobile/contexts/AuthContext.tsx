/**
 * FixMyCondo - Authentication Context
 * Global auth state management for all platforms (mobile & web)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthAPI, TokenService, User } from '../services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isTechnician: boolean;
    isAdmin: boolean;
    isResident: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await TokenService.getAccessToken();
            if (token) {
                try {
                    const userData = await AuthAPI.getMe();
                    setUser(userData);
                    await TokenService.saveUser(userData);
                } catch {
                    // Token expired or invalid, try to use cached user
                    const cachedUser = await TokenService.getUser();
                    if (cachedUser) {
                        setUser(cachedUser);
                    } else {
                        await TokenService.clearTokens();
                    }
                }
            }
        } catch (error) {
            console.log('No valid session found');
            await TokenService.clearTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await AuthAPI.login({ email, password });
            await TokenService.setTokens(response.access_token, response.refresh_token);
            const userData = await AuthAPI.getMe();
            setUser(userData);
            await TokenService.saveUser(userData);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: any) => {
        setIsLoading(true);
        try {
            await AuthAPI.register(data);
            // Auto-login after registration
            await login(data.email, data.password);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AuthAPI.logout();
        } catch (error) {
            // Ignore logout errors
        } finally {
            await TokenService.clearTokens();
            setUser(null);
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await AuthAPI.getMe();
            setUser(userData);
            await TokenService.saveUser(userData);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    // Role helpers
    const userRole = user?.role || '';
    const isTechnician = userRole === 'technician';
    const isAdmin = userRole === 'super_admin' || userRole === 'building_admin';
    const isResident = userRole === 'resident';

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isTechnician,
                isAdmin,
                isResident,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
