'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função de delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função de retry
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (
      retries > 0 &&
      error.message?.includes('Request rate limit reached')
    ) {
      console.log(`Aguardando ${delayMs}ms antes de tentar novamente...`);
      await delay(delayMs);
      return retryWithDelay(fn, retries - 1, delayMs * backoff, backoff);
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Função para atualizar o estado do usuário
  const updateUserState = async (newUser: User | null) => {
    setUser(newUser);
    
    if (newUser) {
      // Se tiver usuário, redireciona para /creditos
      await delay(100); // Pequeno delay para garantir que o estado foi atualizado
      router.refresh();
      router.push('/creditos');
    } else {
      // Se não tiver usuário, redireciona para /login
      router.push('/login');
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await retryWithDelay(
          () => supabase.auth.getSession()
        );
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
          return;
        }

        await updateUserState(session?.user ?? null);
      } catch (error) {
        console.error('Erro ao buscar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await updateUserState(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await retryWithDelay(
        () => supabase.auth.signInWithPassword({
          email,
          password,
        })
      );

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      if (data.user) {
        console.log('Login bem sucedido:', data.user.email);
        await updateUserState(data.user);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await retryWithDelay(
        () => supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        })
      );

      if (error) {
        console.error('Erro no signup:', error);
        throw error;
      }

      if (data.user) {
        console.log('Signup bem sucedido:', data.user.email);
      }
    } catch (error) {
      console.error('Erro no signup:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await retryWithDelay(
        () => supabase.auth.signOut()
      );
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }
      
      await updateUserState(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
