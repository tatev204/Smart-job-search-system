import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

type User = { email: string; firstName: string; lastName: string; };
type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>; // Ավելացված է
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/login', { email, password });
        if (res.data.token) {
            const userData = { email, firstName: res.data.firstName, lastName: res.data.lastName };
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        }
    };

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        const res = await api.post('/register', { firstName, lastName, email, password });
        if (res.data.id) {
            await login(email, password); // Գրանցվելուց հետո ավտոմատ մուտք
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};