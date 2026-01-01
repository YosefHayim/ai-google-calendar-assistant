'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Route error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-600 dark:text-red-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading this page. Please try
            again or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
              View error details
            </summary>
            <div className="mt-3 space-y-2">
              <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/10">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {error.name}: {error.message}
                </p>
              </div>
              {error.digest && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Error ID: {error.digest}
                </p>
              )}
              {error.stack && process.env.NODE_ENV === 'development' && (
                <pre className="max-h-48 overflow-auto rounded-md bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
