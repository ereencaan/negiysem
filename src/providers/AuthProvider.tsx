import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
// Session type used for state management, auth methods return ServiceResult<boolean>
import { authService } from '../services/auth.service';
import type {
  AppUser,
  AuthContextType,
  LoginCredentials,
  RegisterUserCredentials,
  RegisterStylistCredentials,
  ServiceResult,
} from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Session data is not returned directly - the onAuthStateChange listener
  // handles session/user state updates automatically when auth events fire.
  const signIn = useCallback(async (credentials: LoginCredentials): Promise<ServiceResult<boolean>> => {
    return authService.signIn(credentials);
  }, []);

  const signUpUser = useCallback(async (credentials: RegisterUserCredentials): Promise<ServiceResult<boolean>> => {
    return authService.signUpUser(credentials);
  }, []);

  const signUpStylist = useCallback(async (credentials: RegisterStylistCredentials): Promise<ServiceResult<boolean>> => {
    return authService.signUpStylist(credentials);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<ServiceResult<null>> => {
    return authService.resetPassword(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!session,
        signIn,
        signUpUser,
        signUpStylist,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
