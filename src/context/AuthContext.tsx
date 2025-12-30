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

  // Ensure user exists in users table (called on every login) and return their internal user ID
  const ensureUserExists = async (authId: string, email: string): Promise<string> => {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authId)
        .single();

      if (existing) {
        console.log('[ensureUserExists] User already exists. Internal ID:', existing.id);
        return existing.id;
      }

      // User doesn't exist, create them
      console.log('[ensureUserExists] Creating new user record for auth_id:', authId);
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            auth_id: authId,
            email: email,
            display_name: email.split('@')[0], // Use email prefix as default display name
            activity_permissions: 'friends_only',
            theme: 'dark',
            default_language_depth: 'realistic',
          },
        ])
        .select('id')
        .single();

      if (error) {
        console.error('[ensureUserExists] Error creating user record:', error);
        throw error;
      }

      if (!newUser) {
        throw new Error('Failed to create user record');
      }

      console.log('[ensureUserExists] User record created. Internal ID:', newUser.id);
      return newUser.id;
    } catch (err) {
      console.error('[ensureUserExists] Exception:', err);
      throw err;
    }
  };

  // Check session on mount and listen for auth changes
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get existing session from Supabase
        const { data } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(data.session);
          
          if (data.session?.user) {
            // Ensure user exists in users table and get their internal ID
            const internalUserId = await ensureUserExists(data.session.user.id, data.session.user.email || '');
            
            setUser({
              id: internalUserId,
              authId: data.session.user.id,
              email: data.session.user.email || '',
              displayName: data.session.user.user_metadata?.display_name,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes (login, logout, session refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (isMounted) {
          setSession(newSession);

          if (newSession?.user) {
            // When user logs in, ensure they have a record in the users table
            const internalUserId = await ensureUserExists(newSession.user.id, newSession.user.email || '');
            
            setUser({
              id: internalUserId,
              authId: newSession.user.id,
              email: newSession.user.email || '',
              displayName: newSession.user.user_metadata?.display_name,
            });
          } else {
            // Clear user when logged out
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
