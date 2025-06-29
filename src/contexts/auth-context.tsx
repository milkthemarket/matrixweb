"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/firebase/config';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signInWithGoogleAndGetGmailToken: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogleAndGetGmailToken = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    // Requesting scopes for Gmail API
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    provider.addScope('https://www.googleapis.com/auth/gmail.send');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        setAccessToken(credential.accessToken || null);
      }
      setUser(result.user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setAccessToken(null);
    } finally {
        setIsLoading(false);
    }
  };

  const signOutGoogle = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const value = {
    user,
    accessToken,
    isLoading,
    signInWithGoogleAndGetGmailToken,
    signOutGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
