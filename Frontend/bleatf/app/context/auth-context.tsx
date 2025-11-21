'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  userId: number | null;
  userRole: string | null;
  isAuthenticated: boolean;
  login: (userId: number, userRole: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedUserId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('userRole');
    
    if (storedUserId && storedUserRole) {
      setUserId(parseInt(storedUserId));
      setUserRole(storedUserRole);
    }
  }, []);

  const login = (userId: number, userRole: string) => {
    setUserId(userId);
    setUserRole(userRole);
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('userRole', userRole);
  };

  const logout = () => {
    setUserId(null);
    setUserRole(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ userId, userRole, isAuthenticated: !!userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};