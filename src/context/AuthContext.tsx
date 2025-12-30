import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string; // This is auth.users.id (Supabase authentication user ID)
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: Initialize auth state (get session, set user from auth.users)
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth...');
        
        // Use getUser() to ensure auth is fully resolved
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.log('[AuthContext] No authenticated user (expected on first load)');
        }

        if (isMounted) {
          if (authUser) {
            console.log('[AuthContext] Auth user found:', authUser.id);
            // Set user directly with auth.users.id (no need for separate users table)
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              displayName: authUser.user_metadata?.display_name,
            });
          } else {
            console.log('[AuthContext] No authenticated user');
            setUser(null);
          }
          // Auth check complete - stop loading
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log('[AuthContext] Auth state changed:', _event);
        
        if (isMounted) {
          setSession(newSession);

          if (newSession?.user) {
            console.log('[AuthContext] User logged in:', newSession.user.id);
            // Set user directly with auth.users.id
            setUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              displayName: newSession.user.user_metadata?.display_name,
            });
          } else {
            console.log('[AuthContext] User logged out');
            setUser(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // Note: No second useEffect needed for user records
  // languages.owner_id now references auth.users(id) directly
  // User is authenticated and ready to create languages immediately

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      console.log('✅ Signup successful. Check your email to confirm.');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
      console.log('✅ Google sign-in initiated');
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      console.log('✅ Logged out');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
