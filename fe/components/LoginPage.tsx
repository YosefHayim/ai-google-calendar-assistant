
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageCarousel from './ImageCarousel';
import { AllyLogo, BetaBadge } from './logo';
import { InteractiveHoverButton } from './ui/interactive-hover-button';

const carouselImages = [
  'https://images.unsplash.com/photo-1552588147-385012304918?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Focused work, modern laptop
  'https://images.unsplash.com/photo-1543286386-713bdd593766?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Digital planning, calendar UI
  'https://images.unsplash.com/photo-1556740738-b615950ee0b4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Clean, organized tech desk
  'https://images.unsplash.com/photo-1521737711867-ee1375d8616c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Business professional looking focused
  'https://images.unsplash.com/photo-1510519108179-ba09b7dfd4b7?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Abstract blue/purple tech
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.445 12.000c0-.737-.064-1.44-.183-2.12H12v4.08h6.143c-.24 1.157-.96 2.14-2.067 2.795v3.477h4.482c2.62-2.427 4.11-6.02 4.11-10.232z" fill="#4285F4"/>
    <path d="M12 22.5c3.24 0 5.96-1.072 7.947-2.915l-4.482-3.477c-1.246.84-2.85 1.33-3.465 1.33-2.67 0-4.93-1.8-5.74-4.22H1.722v3.542A11.972 11.972 0 0012 22.5z" fill="#34A853"/>
    <path d="M6.26 14.11c-.2-.596-.32-1.23-.32-1.92s.12-1.324.32-1.92V8.748H1.72A11.964 11.964 0 000 12c0 2.07.5 4.01 1.72 5.378l4.54-3.268z" fill="#FBBC05"/>
    <path d="M12 5.535c1.785 0 3.39.613 4.656 1.788L20.12 3.65C17.93 1.54 15.01 0 12 0A11.972 11.972 0 000 12h4.54C5.07 7.33 8.16 5.535 12 5.535z" fill="#EA4335"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const router = useRouter();
  
  const handleGoogleLogin = () => {
    router.push('/dashboard');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-white dark:bg-[#030303] animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity z-50">
          <div className="w-9 h-9 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center shadow-lg text-white dark:text-zinc-900">
            <AllyLogo className="w-5 h-5" />
          </div>
          <span className="font-medium text-2xl tracking-normal flex items-center text-zinc-900 dark:text-zinc-100">
            Ally <BetaBadge />
          </span>
        </Link>
        
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-medium tracking-normal mb-4 text-zinc-900 dark:text-zinc-100">
            Welcome Back
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-lg font-medium">
            Access your private secretary securely.
          </p>
          <div className="space-y-6">
            <InteractiveHoverButton
              text="Login with Google"
              Icon={<GoogleIcon />}
              className="w-full h-14 text-lg shadow-lg border-zinc-200 dark:border-zinc-700"
              onClick={handleGoogleLogin}
            />
          </div>
          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline p-0">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden md:flex p-6 lg:p-12 items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
        <ImageCarousel images={carouselImages} />
      </div>
    </div>
  );
};

export default LoginPage;
