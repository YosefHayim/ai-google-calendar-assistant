/**
 * Authentication Hook
 * Provides authentication state and methods for Client Components
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithOAuth, signInWithPassword, signOut, getSession, getUser } from "@/lib/supabase/auth";
import type { User, Session } from "@supabase/supabase-js";

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithOAuth: (provider: "google" | "github") => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for authentication
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    getSession(supabase).then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignInWithOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: oauthError } = await signInWithOAuth(supabase, provider, {
        next: "/dashboard",
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleSignInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await signInWithPassword(supabase, email, password);

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: signOutError } = await signOut(supabase);

      if (signOutError) {
        setError(signOutError.message);
        setLoading(false);
        return;
      }

      setUser(null);
      setSession(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    const { data, error: refreshError } = await getSession(supabase);

    if (refreshError) {
      setError(refreshError.message);
    } else {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    }

    setLoading(false);
  };

  return {
    user,
    session,
    loading,
    error,
    signInWithOAuth: handleSignInWithOAuth,
    signInWithPassword: handleSignInWithPassword,
    signOut: handleSignOut,
    refresh,
  };
}
