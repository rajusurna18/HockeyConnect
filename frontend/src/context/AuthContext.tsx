import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthResponse, AuthContextType, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hc_user');
    const token = localStorage.getItem('hc_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('hc_user');
        localStorage.removeItem('hc_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authService.login(data);
    const authData = res.data.data;
    localStorage.setItem('hc_token', authData.token);
    localStorage.setItem('hc_user', JSON.stringify(authData));
    setUser(authData);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authService.register(data);
    const authData = res.data.data;
    localStorage.setItem('hc_token', authData.token);
    localStorage.setItem('hc_user', JSON.stringify(authData));
    setUser(authData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{
      user, login, register, logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
