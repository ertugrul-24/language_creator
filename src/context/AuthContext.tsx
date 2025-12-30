import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string; // This will be the internal users.id (UUID from users table), not auth.users.id
  authId?: string; // This is the auth.users.id for reference
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
            // Set user with auth ID - will update with internal ID in next effect
            setUser({
              id: authUser.id,
              authId: authUser.id,
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
            // Set user immediately with auth ID - internal ID will be resolved later
            setUser({
              id: newSession.user.id,
              authId: newSession.user.id,
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

  // Step 2: Ensure user exists in users table (only after auth is confirmed)
  // This is a secondary operation that should not block auth flow
  useEffect(() => {
    if (!user) {
      console.log('[AuthContext] Skipping ensureUserExists - no authenticated user');
      return;
    }

    let isMounted = true;

    const ensureUserExistsInDB = async () => {
      try {
        console.log('[AuthContext] Ensuring user exists in DB...');
        
        // Check if user already exists
        const { data: existing, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.authId || user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is expected
          console.error('[AuthContext] Error checking for existing user:', checkError);
          // Don't throw - just log and continue
          return;
        }

        if (existing && isMounted) {
          console.log('[AuthContext] User already exists in DB. Internal ID:', existing.id);
          // Update user.id to internal database ID
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  id: existing.id,
                }
              : null
          );
          return;
        }

        // User doesn't exist in DB, create them
        console.log('[AuthContext] Creating user record in DB...');
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              auth_id: user.authId || user.id,
              email: user.email,
              display_name: user.displayName || user.email.split('@')[0],
              activity_permissions: 'friends_only',
              theme: 'dark',
              default_language_depth: 'realistic',
            },
          ])
          .select('id')
          .single();

        if (insertError) {
          console.error('[AuthContext] Error creating user record:', insertError);
          // Don't throw - user can still use app with auth ID
          return;
        }

        if (newUser && isMounted) {
          console.log('[AuthContext] User record created. Internal ID:', newUser.id);
          // Update user.id to internal database ID
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  id: newUser.id,
                }
              : null
          );
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error in ensureUserExistsInDB:', err);
        // Don't throw - non-critical operation
      }
    };

    ensureUserExistsInDB();

    return () => {
      isMounted = false;
    };
  }, [user?.authId, user?.email]);

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
