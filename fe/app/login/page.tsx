import LoginPage from "@/components/auth/LoginPage";
import { Suspense } from "react";

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030303]">
      <div className="animate-pulse text-zinc-500">Loading...</div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  );
}
