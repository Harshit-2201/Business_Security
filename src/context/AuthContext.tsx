import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, vaultApi } from '../api';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isVaultLocked: boolean;
  backendConnected: boolean | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  lockVault: () => Promise<void>;
  unlockVault: (masterPassword: string) => Promise<boolean>;
  checkBackendHealth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('fortress_current_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    // Default demo user if token is present
    if (localStorage.getItem('token')) {
      return { id: 1, username: 'security_lead', email: 'alex.chen@cybercore.io', hasMasterPassword: true };
    }
    return null;
  });

  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      // Test ping to backend
      await apiClient.get('/vault/status', { timeout: 2500 });
      setBackendConnected(true);
      return true;
    } catch {
      setBackendConnected(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Handle unauthorized event
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('fortress_current_user');
    };
    window.addEventListener('fortress:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('fortress:unauthorized', handleUnauthorized);
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await authApi.login({ usernameOrEmail, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('fortress_current_user', JSON.stringify(res.user));
    setIsVaultLocked(false);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await authApi.register({ username, email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('fortress_current_user', JSON.stringify(res.user));
    setIsVaultLocked(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('fortress_current_user');
    setIsVaultLocked(true);
  };

  const lockVault = async () => {
    await vaultApi.lock();
    setIsVaultLocked(true);
  };

  const unlockVault = async (masterPassword: string): Promise<boolean> => {
    const success = await vaultApi.unlock(masterPassword);
    if (success) {
      setIsVaultLocked(false);
    }
    return success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isVaultLocked,
        backendConnected,
        login,
        register,
        logout,
        lockVault,
        unlockVault,
        checkBackendHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
