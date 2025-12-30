import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { session: null, error };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { data: null, error };
  }
};

/**
 * Get current session
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error };
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.display_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        displayName: session.user.user_metadata?.display_name,
      });
    } else {
      callback(null);
    }
  });

  return data.subscription;
};
