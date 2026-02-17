import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        console.error("useAuth must be used within an AuthProvider");
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user was logged in (using localStorage only for persistence of session ID, 
    // but here for simplicity we just store the whole user object as before, 
    // OR we can rely on re-fetching. Let's stick to simple persistence for now).
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsLoggedIn(true);

                    // Refresh user data from server to get latest changes (e.g. priceModifier)
                    try {
                        const freshUser = await api.getUser(parsedUser.id);
                        setUser(freshUser);
                        localStorage.setItem('currentUser', JSON.stringify(freshUser));
                        console.log('User data refreshed from server', freshUser);
                    } catch (refreshError) {
                        console.error("Failed to refresh user data", refreshError);
                        // If user doesn't exist anymore, maybe logout? For now, keep local session.
                    }
                }
            } catch (e) {
                console.error("Failed to parse user", e);
                localStorage.removeItem('currentUser');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        // MOCK API CALI
        // await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

        try {
            const user = await api.login(email, password);
            setUser(user);
            setIsLoggedIn(true);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const newUser = await api.register(userData);
            setUser(newUser);
            setIsLoggedIn(true);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('currentUser');
    };

    const updateProfile = async (updatedData) => {
        try {
            const newUser = await api.updateUser(user.id, updatedData);
            setUser(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            return true;
        } catch (error) {
            throw error;
        }
    };

    const [originalAdmin, setOriginalAdmin] = useState(null);

    const impersonateUser = (targetUser) => {
        setOriginalAdmin(user); // Save current admin
        setUser(targetUser);
        localStorage.setItem('currentUser', JSON.stringify(targetUser));
        localStorage.setItem('originalAdmin', JSON.stringify(user)); // Persist admin session too
    };

    const stopImpersonating = () => {
        if (originalAdmin) {
            setUser(originalAdmin);
            localStorage.setItem('currentUser', JSON.stringify(originalAdmin));
            localStorage.removeItem('originalAdmin');
            setOriginalAdmin(null);
        }
    };

    // Restore impersonation state on reload
    useEffect(() => {
        const storedAdmin = localStorage.getItem('originalAdmin');
        if (storedAdmin) {
            setOriginalAdmin(JSON.parse(storedAdmin));
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn,
            login,
            register,
            logout,
            updateProfile,
            loading,
            impersonateUser,
            stopImpersonating,
            isImpersonating: !!originalAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};
