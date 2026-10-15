import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Language } from '../types';
import { setLanguage } from '../i18n';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'seller' | 'buyer' | 'both';
    language: Language;
  }) => Promise<{ success: boolean; error?: string; isFirstUserAdmin?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signout: () => Promise<void>;
  updateProfile: (updates: { name?: string; phone?: string; language?: Language }) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  isInspector: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.language) {
          setLanguage(data.user.language);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('[Auth] Error fetching current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signInWithGoogle = async () => {
    try {
      const { googleSignIn } = await import('../lib/firebase');
      const result = await googleSignIn();
      if (!result) return { success: false, error: 'Google sign-in cancelled or failed' };

      setAccessToken(result.accessToken);

      // Create or update local user representation
      const googleUser: User = {
        id: result.user.uid,
        email: result.user.email || 'user@example.com',
        name: result.user.displayName || 'Google User',
        role: 'buyer',
        language: 'en',
        created_at: new Date().toISOString(),
      };

      setUser(googleUser);

      // Sync user to Cloud SQL PostgreSQL database
      try {
        await fetch('/api/cloudsql/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          }),
        });
      } catch (sqlErr) {
        console.warn('Could not sync user to Cloud SQL:', sqlErr);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      return { success: false, error: err.message || 'Google sign-in failed' };
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Sign in failed' };
      }
      setUser(data.user);
      if (data.user.language) setLanguage(data.user.language);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred during sign in.' };
    }
  };

  const signup = async (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'seller' | 'buyer' | 'both';
    language: Language;
  }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Sign up failed' };
      }
      setUser(data.user);
      if (data.user.language) setLanguage(data.user.language);
      return { success: true, isFirstUserAdmin: data.isFirstUserAdmin };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred during sign up.' };
    }
  };

  const signout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      const { logoutGoogle } = await import('../lib/firebase');
      await logoutGoogle();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setAccessToken(null);
      window.location.hash = '#/';
    }
  };

  const updateProfile = async (updates: { name?: string; phone?: string; language?: Language }) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      setUser(data.user);
      if (updates.language) setLanguage(updates.language);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating profile.' };
    }
  };

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller' || user?.role === 'both' || user?.role === 'admin';
  const isBuyer = user?.role === 'buyer' || user?.role === 'both' || user?.role === 'admin';
  const isInspector = user?.role === 'inspector' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        signin,
        signup,
        signInWithGoogle,
        signout,
        updateProfile,
        isAdmin,
        isSeller,
        isBuyer,
        isInspector
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
