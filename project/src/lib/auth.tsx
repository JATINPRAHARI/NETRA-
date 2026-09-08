import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { demoStore, DEMO_PROFILE } from '@/lib/demo-data';
import type { Profile } from './types';

type AuthContextType = {
  user: Profile | null;
  isDemo: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  demoLogin: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase not configured. Use Demo Access instead.' };
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return { error: error.message };
    }
    const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (data) {
      setUser(data);
      setIsDemo(false);
    }
    setLoading(false);
    return {};
  };

  const demoLogin = () => {
    setUser(DEMO_PROFILE);
    setIsDemo(true);
    demoStore.getAuditLogs();
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsDemo(false);
  };

  return (
    <AuthContext.Provider value={{ user, isDemo, loading, signIn, demoLogin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { demoStore };
