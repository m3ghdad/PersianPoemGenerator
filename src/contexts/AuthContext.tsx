import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshSession: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Helper function to clear invalid session
    const clearInvalidSession = async () => {
      try {
        console.log('Clearing invalid session...');
        // Clear local storage
        localStorage.removeItem('supabase.auth.token');
        
        // Clear all auth-related items in localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear session storage
        sessionStorage.clear();
        
        // Sign out from Supabase (silent)
        await supabase.auth.signOut();
        
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error clearing session:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Get initial session with enhanced error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session initialization error:', error);
          
          // Check for refresh token errors
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('Invalid Refresh Token') ||
              error.message.includes('JWT expired') ||
              error.name === 'AuthApiError') {
            console.log('Invalid session detected, clearing authentication state');
            await clearInvalidSession();
            return;
          }
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          await clearInvalidSession();
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;
        
        // Handle specific auth events
        switch (event) {
          case 'SIGNED_OUT':
            console.log('User signed out');
            setUser(null);
            setLoading(false);
            break;
            
          case 'TOKEN_REFRESHED':
            if (!session) {
              console.log('Token refresh failed, clearing session');
              await clearInvalidSession();
            } else {
              console.log('Token refreshed successfully');
              setUser(session.user);
              setLoading(false);
            }
            break;
            
          case 'SIGNED_IN':
            console.log('User signed in');
            setUser(session?.user ?? null);
            setLoading(false);
            break;
            
          default:
            setUser(session?.user ?? null);
            setLoading(false);
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Import project info
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // Create user on server with admin privileges
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c192d0ee/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific error codes from server
        if (result.error === 'email_exists') {
          return { error: 'A user with this email address has already been registered' };
        } else if (result.error === 'weak_password') {
          return { error: 'Password is too weak' };
        } else if (result.error === 'invalid_email') {
          return { error: 'Invalid email address' };
        } else {
          return { error: result.error || 'Failed to create account' };
        }
      }

      // Now sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        return { error: signInError.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      // Clear any cached session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if signOut fails, clear local state
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        
        // If refresh token is invalid, clear everything and sign out
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('Invalid Refresh Token') ||
            error.message.includes('JWT expired') ||
            error.name === 'AuthApiError') {
          console.log('Invalid refresh token detected, clearing session');
          
          // Clear localStorage first
          try {
            localStorage.removeItem('supabase.auth.token');
            
            // Clear all Supabase auth items
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('sb-')) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          } catch (storageError) {
            console.warn('Error clearing localStorage:', storageError);
          }
          
          // Sign out and update state
          await signOut();
          return { error: 'Your session has expired. Please sign in again.' };
        }
        
        return { error: error.message };
      }
      
      if (data?.session) {
        console.log('Session refreshed successfully');
        setUser(data.session.user);
      }
      
      return {};
    } catch (error) {
      console.error('Unexpected refresh error:', error);
      
      // If it's a network or other error, try to clear session
      if (error instanceof Error && error.message.includes('refresh_token')) {
        console.log('Clearing session due to refresh token error');
        await signOut();
        return { error: 'Session expired. Please sign in again.' };
      }
      
      return { error: 'Failed to refresh session' };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}