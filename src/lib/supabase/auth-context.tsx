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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check local storage for demo mode
    const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('codepilot_demo_user') : null;
    const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('codepilot_user_role') as UserRole) : null;

    if (storedDemo === 'true') {
      setIsDemoUser(true);
      const isFaculty = storedRole === 'faculty';
      setRole(isFaculty ? 'faculty' : 'student');

      setUser({
        id: isFaculty ? 'demo-faculty-user' : 'demo-student-user',
        email: isFaculty ? 'prof.sharma@mitaoe.ac.in' : 'aman.mahadik@mitaoe.ac.in',
        user_metadata: {
          full_name: isFaculty ? 'Prof. R. K. Sharma' : 'Aman Atmaram Mahadik',
          avatar_url: isFaculty ? null : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
          role: isFaculty ? 'faculty' : 'student',
          institution: 'MIT Academy of Engineering, Pune',
          department: 'School of Computer Engineering',
          prn: isFaculty ? 'FACULTY-008' : '202502100006',
          roll_no: isFaculty ? 'Staff' : '68',
          batch: 'B3',
        },
        app_metadata: {
          provider: isFaculty ? 'email' : 'github',
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User);
      setIsLoading(false);
      return;
    }

    // Supabase auth state listener
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const userRole = (session.user.user_metadata?.role as UserRole) || 
            (session.user.app_metadata?.provider === 'github' ? 'student' : 'faculty');
          setRole(userRole);
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsDemoUser(false);
        localStorage.removeItem('codepilot_demo_user');
        const userRole = (session.user.user_metadata?.role as UserRole) || 
          (session.user.app_metadata?.provider === 'github' ? 'student' : 'faculty');
        setRole(userRole);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGithub = async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          scopes: 'read:user user:email repo',
          queryParams: {
            role: 'student',
          },
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
        },
      });
      return { error };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const signInWithEmail = async (email: string, password: string, desiredRole: UserRole = 'faculty') => {
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
    userRole: UserRole = 'faculty'
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || (userRole === 'faculty' ? 'Faculty Member' : 'Student Developer'),
            role: userRole,
            institution: 'MIT Academy of Engineering, Pune',
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
    localStorage.setItem('codepilot_demo_user', 'true');
    localStorage.setItem('codepilot_user_role', 'student');
    setIsDemoUser(true);
    setRole('student');
    setUser({
      id: 'demo-student-user',
      email: 'aman.mahadik@mitaoe.ac.in',
      user_metadata: {
        full_name: 'Aman Atmaram Mahadik',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
        role: 'student',
        user_name: 'amanmahadik',
        institution: 'MIT Academy of Engineering, Pune',
        department: 'School of Computer Engineering',
        prn: '202502100006',
        roll_no: '68',
        batch: 'B3',
      },
      app_metadata: { provider: 'github' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User);
  };

  const enableFacultyDemo = () => {
    localStorage.setItem('codepilot_demo_user', 'true');
    localStorage.setItem('codepilot_user_role', 'faculty');
    setIsDemoUser(true);
    setRole('faculty');
    setUser({
      id: 'demo-faculty-user',
      email: 'prof.sharma@mitaoe.ac.in',
      user_metadata: {
        full_name: 'Prof. R. K. Sharma',
        avatar_url: null,
        role: 'faculty',
        user_name: 'prof-sharma',
        institution: 'MIT Academy of Engineering, Pune',
        department: 'School of Computer Engineering',
        prn: 'FACULTY-008',
        roll_no: 'Staff Advisor',
        batch: 'B3',
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
