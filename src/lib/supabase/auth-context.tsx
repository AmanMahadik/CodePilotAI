'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';

export type UserRole = 'student' | 'faculty';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isDemoUser: boolean;
  signInWithGithub: (options?: { loginHint?: string }) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string, role?: UserRole) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  const resolveUserRole = (u: User | null): UserRole => {
    if (!u) {
      const stored = typeof window !== 'undefined' ? (localStorage.getItem('codepilot_user_role') as UserRole) : null;
      return stored || 'student';
    }

    // Check metadata role if explicitly set
    if (u.user_metadata?.role?.toLowerCase() === 'faculty') return 'faculty';
    if (u.user_metadata?.role?.toLowerCase() === 'student') return 'student';

    // Check localStorage saved role
    const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('codepilot_user_role') as UserRole) : null;
    if (storedRole) return storedRole;

    // Default to student for all users
    return 'student';
  };

  useEffect(() => {
    // 1. Supabase initial session check
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const userRole = resolveUserRole(session.user);
          setRole(userRole);
          setIsDemoUser(false);
        } else {
          // Check server-side session API (/api/auth/me) for password or custom OAuth logins
          try {
            const meRes = await fetch('/api/auth/me');
            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.authenticated && meData.user) {
                const mappedUser = {
                  id: meData.user.id,
                  email: meData.user.email,
                  user_metadata: {
                    full_name: meData.user.name,
                    role: meData.user.role?.toLowerCase() || 'student',
                    institution: meData.user.institution,
                  },
                  app_metadata: { provider: 'email' },
                  aud: 'authenticated',
                  created_at: new Date().toISOString(),
                } as unknown as User;

                setUser(mappedUser);
                setRole(meData.user.role?.toLowerCase() === 'faculty' ? 'faculty' : 'student');
                setIsDemoUser(false);
                return;
              }
            }
          } catch {
            // Server session check fallback
          }
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsDemoUser(false);
        localStorage.removeItem('codepilot_demo_active');
        localStorage.removeItem('codepilot_demo_user');
        const userRole = resolveUserRole(session.user);
        setRole(userRole);
      } else {
        const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('codepilot_demo_active') : null;
        if (!storedDemo) {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchRole = async (newRole: UserRole) => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('codepilot_user_role', newRole);
    }
    if (user) {
      try {
        await supabase.auth.updateUser({
          data: { role: newRole }
        });
      } catch (e) {
        console.warn('Could not persist role in Supabase metadata:', e);
      }
    }
  };

  const signInWithGithub = async (options?: { loginHint?: string }) => {
    try {
      if (typeof window !== 'undefined') {
        // Clear any previously cached student/GitHub session data before starting account selection
        localStorage.removeItem('codepilot_demo_active');
        localStorage.removeItem('codepilot_demo_user');
        localStorage.removeItem('codepilot_student_gh_username');
        localStorage.removeItem('codepilot_student_name');
        localStorage.removeItem('codepilot_student_avatar');
        localStorage.removeItem('codepilot_student_repos');
        localStorage.removeItem('codepilot_gh_token');
      }
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {}

      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const queryParams: Record<string, string> = {
        role: 'student',
        prompt: 'select_account',
      };
      const cleanLogin = options?.loginHint?.trim().replace(/^@/, '');
      if (cleanLogin) {
        queryParams.login = cleanLogin;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          scopes: 'read:user user:email repo',
          queryParams,
        },
      });
      return { error };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: redirectUrl,
          queryParams: { role: 'student' }
        },
      });
      return { error };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const signInWithEmail = async (email: string, password: string, desiredRole: UserRole = 'student') => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        setRole(desiredRole);
        if (typeof window !== 'undefined') {
          localStorage.setItem('codepilot_user_role', desiredRole);
        }
      }
      return { error };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    fullName?: string, 
    userRole: UserRole = 'student'
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'Student Developer',
            role: userRole,
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      return { error };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined,
      });
      return { error };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('codepilot_demo_active');
    localStorage.removeItem('codepilot_demo_user');
    localStorage.removeItem('codepilot_user_role');
    localStorage.removeItem('codepilot_student_gh_username');
    localStorage.removeItem('codepilot_student_name');
    localStorage.removeItem('codepilot_student_avatar');
    localStorage.removeItem('codepilot_student_repos');
    localStorage.removeItem('codepilot_gh_token');
    setIsDemoUser(false);
    setUser(null);
    setSession(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut warning:', e);
    }
  };

  const refreshSession = async () => {
    try {
      const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          const resolvedRole: UserRole =
            meData.user.role?.toLowerCase() === 'faculty' ? 'faculty' : 'student';
          const mappedUser = {
            id: meData.user.id,
            email: meData.user.email,
            user_metadata: {
              full_name: meData.user.name,
              role: resolvedRole,
              institution: meData.user.institution,
            },
            app_metadata: { provider: 'email' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as unknown as User;

          setUser(mappedUser);
          setRole(resolvedRole);
          setIsDemoUser(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('codepilot_user_role', resolvedRole);
          }
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        isDemoUser,
        signInWithGithub,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        switchRole,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
