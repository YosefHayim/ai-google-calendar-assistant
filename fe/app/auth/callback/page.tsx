"use client";

/**
 * OAuth Callback Page (Client-Side)
 * Handles OAuth callbacks with tokens in hash fragments
 */

import { ERROR_MESSAGES, ROUTES, TIMEOUTS } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [error, setError] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>["data"]["subscription"] | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleCallback = async () => {
      // Prevent multiple processing
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      try {
        // Check for error in hash or query
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const errorParam = hashParams.get("error") || searchParams.get("error");

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setStatus("error");
          setTimeout(() => {
            router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorParam)}`);
          }, TIMEOUTS.ERROR_REDIRECT_DELAY);
          return;
        }

        // Check if we have a code in query string (authorization code flow)
        const code = searchParams.get("code");
        if (code) {
          // Exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError || !data.session) {
            setError(exchangeError?.message || ERROR_MESSAGES.FAILED_TO_EXCHANGE_CODE);
            setStatus("error");
            setTimeout(() => {
              router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(exchangeError?.message || ERROR_MESSAGES.AUTH_FAILED)}`);
            }, TIMEOUTS.ERROR_REDIRECT_DELAY);
            return;
          }

          // Clear query params and redirect
          const next = searchParams.get("next") || ROUTES.DASHBOARD;
          window.history.replaceState(null, "", window.location.pathname);
          router.replace(next);
          return;
        }

        // If we have tokens in hash fragment, wait for Supabase to process them
        if (hash && (hash.includes("access_token") || hash.includes("error"))) {
          // Set up auth state listener to wait for session
          const {
            data: { subscription: authSubscription },
          } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
              // Clean up
              authSubscription.unsubscribe();
              if (timeoutId) clearTimeout(timeoutId);

              // Clear hash from URL
              window.history.replaceState(null, "", window.location.pathname);

              // Redirect to dashboard or next page
              const next = searchParams.get("next") || ROUTES.DASHBOARD;
              router.replace(next);
            } else if (event === "SIGNED_OUT") {
              authSubscription.unsubscribe();
              if (timeoutId) clearTimeout(timeoutId);
              setError(ERROR_MESSAGES.AUTHENTICATION_FAILED_GENERIC);
              setStatus("error");
              setTimeout(() => {
                router.replace(`${ROUTES.LOGIN}?error=${ERROR_MESSAGES.AUTHENTICATION_FAILED}`);
              }, TIMEOUTS.ERROR_REDIRECT_DELAY);
            }
          });
          subscription = authSubscription;

          // Fallback: check session after a short delay if auth state change doesn't fire
          timeoutId = setTimeout(async () => {
            if (subscription) {
              subscription.unsubscribe();
              subscription = null;
            }

            const {
              data: { session: fallbackSession },
              error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
              setError(sessionError.message);
              setStatus("error");
              setTimeout(() => {
                router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(sessionError.message)}`);
              }, TIMEOUTS.ERROR_REDIRECT_DELAY);
              return;
            }

            if (fallbackSession) {
              // Clear hash from URL
              window.history.replaceState(null, "", window.location.pathname);
              const next = searchParams.get("next") || ROUTES.DASHBOARD;
              router.replace(next);
            } else {
              setError(ERROR_MESSAGES.NO_SESSION_FOUND);
              setStatus("error");
              setTimeout(() => {
                router.replace(`${ROUTES.LOGIN}?error=${ERROR_MESSAGES.NO_SESSION}`);
              }, TIMEOUTS.ERROR_REDIRECT_DELAY);
            }
          }, TIMEOUTS.AUTH_STATE_CHANGE_FALLBACK);
          return;
        }

        // If no hash with tokens, check for existing session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          setStatus("error");
          setTimeout(() => {
            router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(sessionError.message)}`);
          }, TIMEOUTS.ERROR_REDIRECT_DELAY);
          return;
        }

        if (session) {
          // Clear hash from URL if present
          window.history.replaceState(null, "", window.location.pathname);
          const next = searchParams.get("next") || ROUTES.DASHBOARD;
          router.replace(next);
        } else {
          setError(ERROR_MESSAGES.NO_SESSION_FOUND);
          setStatus("error");
          setTimeout(() => {
            router.replace(`${ROUTES.LOGIN}?error=${ERROR_MESSAGES.NO_SESSION}`);
          }, TIMEOUTS.ERROR_REDIRECT_DELAY);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.AUTHENTICATION_FAILED_GENERIC;
        setError(errorMessage);
        setStatus("error");
        setTimeout(() => {
          router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`);
        }, TIMEOUTS.ERROR_REDIRECT_DELAY);
      }
    };

    handleCallback();

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === "processing" ? (
          <>
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Completing authentication...</p>
          </>
        ) : (
          <>
            <p className="text-destructive">Authentication failed</p>
            {error && <p className="text-sm text-muted-foreground">{error}</p>}
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}
