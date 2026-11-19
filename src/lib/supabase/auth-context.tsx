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
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string, role?: UserRole) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enableStudentDemo: () => void;
  enableFacultyDemo: () => void;
  enableDemoUser: () => void;
  switchRole: (role: UserRole) => Promise<void>;
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

    // Aman Mahadik is explicitly a Student Developer
    const email = (u.email || '').toLowerCase();
    const fullName = ((u.user_metadata?.full_name as string) || '').toLowerCase();
    if (email.includes('amanmahadik') || fullName.includes('aman mahadik')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('codepilot_user_role', 'student');
      }
      return 'student';
    }

    // Check localStorage saved role
    const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('codepilot_user_role') as UserRole) : null;
    if (storedRole) return storedRole;

    // Check metadata role if explicitly set
    if (u.user_metadata?.role === 'faculty') return 'faculty';
    if (u.user_metadata?.role === 'student') return 'student';

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
          // Check if demo user was explicitly enabled
          const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('codepilot_demo_active') : null;
          const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('codepilot_user_role') as UserRole) : null;
          if (storedDemo === 'true') {
            const isFaculty = storedRole === 'faculty';
            setIsDemoUser(true);
            setRole(isFaculty ? 'faculty' : 'student');
            setUser({
              id: isFaculty ? 'demo-faculty-user' : 'demo-student-user',
              email: isFaculty ? 'faculty@university.edu' : 'student@university.edu',
              user_metadata: {
                full_name: isFaculty ? 'Faculty Reviewer' : 'Student Developer',
                role: isFaculty ? 'faculty' : 'student',
                institution: 'University Engineering Department',
              },
              app_metadata: { provider: isFaculty ? 'email' : 'github' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as unknown as User);
          } else {
            setUser(null);
          }
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

  const signInWithGithub = async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          scopes: 'read:user user:email repo',
          queryParams: { role: 'student' },
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
    setIsDemoUser(false);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut warning:', e);
    }
  };

  const enableStudentDemo = () => {
    localStorage.setItem('codepilot_demo_active', 'true');
    localStorage.setItem('codepilot_user_role', 'student');
    setIsDemoUser(true);
    setRole('student');
    setUser({
      id: 'demo-student-user',
      email: 'student@university.edu',
      user_metadata: {
        full_name: 'Aman Mahadik',
        avatar_url: null,
        role: 'student',
        user_name: 'amanmahadik',
        institution: 'Department of Computer Science & Engineering',
      },
      app_metadata: { provider: 'github' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User);
  };

  const enableFacultyDemo = () => {
    localStorage.setItem('codepilot_demo_active', 'true');
    localStorage.setItem('codepilot_user_role', 'faculty');
    setIsDemoUser(true);
    setRole('faculty');
    setUser({
      id: 'demo-faculty-user',
      email: 'faculty@university.edu',
      user_metadata: {
        full_name: 'Faculty Evaluator',
        avatar_url: null,
        role: 'faculty',
        user_name: 'faculty-evaluator',
        institution: 'Department of Computer Science & Engineering',
      },
      app_metadata: { provider: 'email' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User);
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
        enableStudentDemo,
        enableFacultyDemo,
        enableDemoUser: enableStudentDemo,
        switchRole,
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
