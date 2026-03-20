import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { authService, AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      // Silent cleanup
      setUser(null);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Verificar usuário atual
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error: any) {
        // Handle invalid refresh token
        if (error?.message?.includes('refresh') || error?.message?.includes('Invalid')) {
          console.log('Invalid session detected, clearing...');
          await clearSession();
        } else {
          console.error('Erro ao verificar usuário:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Listener de mudanças de autenticação
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      // O listener vai atualizar o estado automaticamente
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, displayName: string) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, username, displayName);
      // O listener vai atualizar o estado automaticamente
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (error: any) {
      // Even if logout fails, clear local state
      setUser(null);
      throw new Error(error.message || 'Erro ao sair');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar email de recuperação');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      resetPassword, 
      loading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}