import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import type {
  AppUser,
  ActiveRole,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  CreateStylistProfileData,
  ServiceResult,
} from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<ActiveRole>('user');

  const isStylist = user?.stylistProfile !== null && user?.stylistProfile !== undefined;

  useEffect(() => {
    // Restore session on mount
    authService.getSession().then(async (currentSession) => {
      setSession(currentSession as Session | null);
      if (currentSession) {
        try {
          const appUser = await authService.getCurrentUser();
          setUser(appUser);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event: string, newSession: unknown) => {
        setSession(newSession as Session | null);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const appUser = await authService.getCurrentUser();
            setUser(appUser);
          } catch (err) {
            console.error('Failed to fetch user on auth change:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setActiveRoleState('user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials): Promise<ServiceResult<boolean>> => {
    return authService.signIn(credentials);
  }, []);

  const signUp = useCallback(async (credentials: RegisterCredentials): Promise<ServiceResult<boolean>> => {
    return authService.signUp(credentials);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setActiveRoleState('user');
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<ServiceResult<null>> => {
    return authService.resetPassword(email);
  }, []);

  const setActiveRole = useCallback((role: ActiveRole) => {
    if (role === 'stylist' && !isStylist) return;
    setActiveRoleState(role);
  }, [isStylist]);

  const createStylistProfile = useCallback(async (data: CreateStylistProfileData): Promise<ServiceResult<boolean>> => {
    if (!user) return { data: null, error: 'errors.generic' };
    const result = await authService.createStylistProfile(user.id, data);
    if (result.data) {
      // Re-fetch user to get updated stylist profile
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
      setActiveRoleState('stylist');
    }
    return result;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!session,
        activeRole,
        isStylist,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setActiveRole,
        createStylistProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
