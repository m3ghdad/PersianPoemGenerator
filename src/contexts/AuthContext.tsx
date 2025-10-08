import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, redirectUrl?: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
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

  // Cleanup any corrupted auth state on initialization
  const cleanupCorruptedAuth = async () => {
    try {
      // Check for any obvious corruption indicators in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              // Try to parse the auth data
              const parsed = JSON.parse(value);
              // Check if it looks corrupted (missing required fields)
              if (parsed && typeof parsed === 'object' && 
                  parsed.access_token && 
                  parsed.expires_at && 
                  parsed.expires_at < Math.floor(Date.now() / 1000) - 86400) { // Expired more than a day ago
                console.log('Found very old expired token, clearing:', key);
                localStorage.removeItem(key);
              }
            }
          } catch (parseError) {
            // If we can't parse it, it's corrupted - remove it
            console.log('Found corrupted auth data, removing:', key);
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Error during auth cleanup:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Clean up any obviously corrupted auth data first
    cleanupCorruptedAuth();

    // Helper function to clear invalid session
    const clearInvalidSession = async () => {
      try {
        console.log('Clearing invalid session...');
        
        // First, set loading and user state immediately
        if (mounted) {
          setUser(null);
        }
        
        // Clear local storage more comprehensively
        try {
          // Clear Supabase auth token
          localStorage.removeItem('supabase.auth.token');
          
          // Clear all auth-related items in localStorage
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              // Ignore individual key removal errors
            }
          });
        } catch (storageError) {
          console.warn('Error clearing localStorage:', storageError);
        }
        
        // Clear session storage
        try {
          sessionStorage.clear();
        } catch (sessionError) {
          console.warn('Error clearing sessionStorage:', sessionError);
        }
        
        // Sign out from Supabase (silent)
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn('Silent sign out failed:', signOutError);
          // Don't throw - we still want to clear the local state
        }
        
        if (mounted) {
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

    // Check if session data exists in localStorage before attempting to get session
    const preCheckSession = () => {
      try {
        // Check if there are any Supabase auth keys in localStorage
        let hasAuthData = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
            hasAuthData = true;
            break;
          }
        }
        return hasAuthData;
      } catch (error) {
        console.warn('Error checking localStorage:', error);
        return false;
      }
    };

    // Get initial session with enhanced error handling
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for OAuth callback...');
        console.log('Current URL:', window.location.href);
        
        // CRITICAL: Check for PKCE flow (Authorization Code flow)
        // Supabase uses this by default - code is in query params (?code=...)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log('🔐 PKCE OAuth redirect detected! Exchanging code for session...');
          console.log('Code found in query params');
          
          try {
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('❌ Code exchange error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              // Clean up the URL even on error
              window.history.replaceState(null, '', window.location.pathname);
              if (mounted) {
                setUser(null);
                setLoading(false);
              }
              return;
            }
            
            if (data?.session?.user) {
              console.log('✅ PKCE OAuth session established successfully!');
              console.log('✅ User email:', data.session.user.email);
              console.log('✅ User ID:', data.session.user.id);
              if (mounted) {
                setUser(data.session.user);
                setLoading(false);
              }
              // Clean up the URL after successful login
              window.history.replaceState(null, '', window.location.pathname);
              return;
            } else {
              console.warn('⚠️ No session data returned from code exchange');
              console.warn('Data received:', data);
            }
          } catch (oauthError) {
            console.error('❌ Exception while exchanging code:', oauthError);
            // Clean up URL on error
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
        
        // FALLBACK: Check for Implicit flow (less common, but still supported)
        // Tokens in URL hash fragment (#access_token=...&refresh_token=...)
        const hash = window.location.hash;
        console.log('Hash:', hash ? hash.substring(0, 50) + '...' : 'none');
        
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const hasOAuthToken = accessToken && refreshToken;
        
        if (hasOAuthToken) {
          console.log('🔐 Implicit OAuth redirect detected! Processing tokens...');
          console.log('Hash params found:', Array.from(hashParams.keys()).join(', '));
          
          try {
            // Set the session using the tokens from the URL hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken!,
              refresh_token: refreshToken!
            });
            
            if (error) {
              console.error('❌ OAuth session error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              // Clean up the URL even on error
              window.history.replaceState(null, '', window.location.pathname);
              if (mounted) {
                setUser(null);
                setLoading(false);
              }
              return;
            }
            
            if (data?.session?.user) {
              console.log('✅ OAuth session established successfully!');
              console.log('✅ User email:', data.session.user.email);
              console.log('✅ User ID:', data.session.user.id);
              if (mounted) {
                setUser(data.session.user);
                setLoading(false);
              }
              // Clean up the URL hash after successful login
              window.history.replaceState(null, '', window.location.pathname);
              return;
            } else {
              console.warn('⚠️ No session data returned from setSession');
              console.warn('Data received:', data);
            }
          } catch (oauthError) {
            console.error('❌ Exception while processing OAuth tokens:', oauthError);
            // Clean up URL on error
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else if (hash.includes('error')) {
          // Handle OAuth errors in hash
          const errorDescription = hashParams.get('error_description');
          const errorCode = hashParams.get('error');
          console.error('❌ OAuth error in callback:', errorCode, errorDescription);
          // Clean up URL
          window.history.replaceState(null, '', window.location.pathname);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        } else {
          console.log('ℹ️ No OAuth code or tokens found in URL');
        }
        
        // If no auth data exists and not OAuth redirect, skip session check
        if (!preCheckSession() && !hasOAuthToken) {
          console.log('No existing auth data found, skipping session check');
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

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
        
        // If we have a session, validate it's not expired
        if (session) {
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            console.log('Session is expired, attempting refresh');
            const refreshResult = await refreshSession();
            if (refreshResult.error) {
              console.log('Refresh failed, clearing session');
              await clearInvalidSession();
              return;
            }
          } else {
            if (mounted) {
              setUser(session.user);
              setLoading(false);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          await clearInvalidSession();
        }
      }
    };

    // Define refreshSession function before it's used
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
            await clearInvalidSession();
            return { error: 'Your session has expired. Please sign in again.' };
          }
          
          return { error: error.message };
        }
        
        if (data?.session && mounted) {
          console.log('Session refreshed successfully');
          setUser(data.session.user);
        }
        
        return {};
      } catch (error) {
        console.error('Unexpected refresh error:', error);
        
        // If it's a network or other error, try to clear session
        if (error instanceof Error && error.message.includes('refresh_token')) {
          console.log('Clearing session due to refresh token error');
          await clearInvalidSession();
          return { error: 'Session expired. Please sign in again.' };
        }
        
        return { error: 'Failed to refresh session' };
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
            
            // If user signed in with Google and has a profile picture, sync it
            if (session?.user) {
              // Google profile picture is now handled automatically by ProfileContext
              const avatarUrl = session.user.user_metadata?.avatar_url;
              const providerId = session.user.app_metadata?.provider;
              
              if (providerId === 'google' && avatarUrl) {
                console.log('Google user detected with profile picture:', avatarUrl);
              }
            }
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

  const signInWithGoogle = async () => {
    try {
      console.log('🚀 Starting Google OAuth flow...');
      console.log('📍 Current URL:', window.location.href);
      console.log('🏠 Hostname:', window.location.hostname);
      
      // Use rubatar.com in production, localhost for development
      const baseUrl = window.location.hostname === 'localhost' 
        ? window.location.origin 
        : 'https://rubatar.com';
      
      console.log('🔄 Redirect URL:', baseUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: baseUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('❌ Google OAuth error:', error);
        return { error: error.message };
      }
      
      console.log('✅ OAuth redirect initiated');
      console.log('📦 Data:', data);
      return {};
    } catch (error) {
      console.error('❌ Unexpected Google OAuth error:', error);
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

      // Return success with verification needed flag
      // User must verify email before they can sign in
      return { needsVerification: true };
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

  const resetPassword = async (email: string, redirectUrl?: string) => {
    try {
      // Use rubatar.com in production, localhost for development
      const baseUrl = window.location.hostname === 'localhost' 
        ? window.location.origin 
        : 'https://rubatar.com';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl || `${baseUrl}?reset=true`,
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  // External refreshSession function for the context
  const externalRefreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('External session refresh error:', error);
        
        // If refresh token is invalid, clear everything
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('Invalid Refresh Token') ||
            error.message.includes('JWT expired') ||
            error.name === 'AuthApiError') {
          console.log('Invalid refresh token detected in external call, clearing session');
          
          // Clear localStorage comprehensively
          try {
            localStorage.removeItem('supabase.auth.token');
            
            // Clear all Supabase auth items
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => {
              try {
                localStorage.removeItem(key);
              } catch (e) {
                // Ignore individual key removal errors
              }
            });
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
        console.log('External session refreshed successfully');
        setUser(data.session.user);
      }
      
      return {};
    } catch (error) {
      console.error('Unexpected external refresh error:', error);
      
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
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession: externalRefreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}