"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ErrorMessage } from "@/components/auth/error-message";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signInWithOAuth, loading, error } = useAuth();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  const errorParam = searchParams.get("error");
  const displayError = error || (errorParam ? decodeURIComponent(errorParam) : null);

  // Handle OAuth callback with tokens in hash fragment
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if there are tokens in the hash fragment
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      if (!hash || hash.length === 0) return;

      // Check if hash contains access_token (OAuth callback)
      if (hash.includes("access_token") || hash.includes("error")) {
        setIsProcessingAuth(true);
        const supabase = createClient();

        try {
          // Supabase client will automatically detect and handle tokens in the hash
          // We just need to get the session
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);
            router.replace("/login?error=" + encodeURIComponent(sessionError.message));
            setIsProcessingAuth(false);
            return;
          }

          if (session) {
            // Clear the hash from URL
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
            // Redirect to dashboard
            const next = searchParams.get("next") || ROUTES.DASHBOARD;
            router.replace(next);
          } else {
            setIsProcessingAuth(false);
          }
        } catch (err) {
          console.error("Auth callback error:", err);
          const errorMessage = err instanceof Error ? err.message : "Authentication failed";
          router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`);
          setIsProcessingAuth(false);
        }
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  const handleGoogleSignIn = () => {
    signInWithOAuth("google");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold dark:text-white text-black">Welcome to CAL AI</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Sign in with your Google account to manage your calendar with AI</p>
        </div>

        <ErrorMessage error={displayError} />

        <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={loading || isProcessingAuth} />

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground px-4">
          By continuing, you agree to our{" "}
          <a href={ROUTES.TERMS} className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href={ROUTES.PRIVACY} className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
