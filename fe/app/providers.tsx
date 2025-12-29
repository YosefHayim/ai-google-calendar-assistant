"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../components/ThemeProvider";
import { CursorProvider, Cursor } from "../components/ui/animated-cursor";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CursorProvider>
        <div className="noise" aria-hidden="true" />
        <Cursor>
          <svg
            className="size-6 text-primary drop-shadow-lg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
          >
            <path
              fill="currentColor"
              d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
            />
          </svg>
        </Cursor>
        {children}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (pointer: fine) {
                * { cursor: none !important; }
              }
            `,
          }}
        />
      </CursorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
