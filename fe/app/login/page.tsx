"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ErrorMessage } from "@/components/auth/error-message";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { signInWithOAuth, loading, error } = useAuth();

  const errorParam = searchParams.get("error");
  const displayError = error || (errorParam ? decodeURIComponent(errorParam) : null);

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

        <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={loading} />

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground px-4">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
