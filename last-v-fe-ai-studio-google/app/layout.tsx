"use client";

import "../styles/globals.css";
import { Cursor, CursorProvider } from "../components/ui/animated-cursor";
import { ThemeProvider } from "../components/ThemeProvider";

import React from "react";

/**
 * RootLayout serves as the outer wrapper for the application.
 * Note: CSS is loaded via index.html to ensure compatibility with native ES modules.
 */
export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>Ally | The AI Secretary for your Google Calendar</title>
      </head>
      <body>
        <ThemeProvider>
          <CursorProvider>
            <div className="noise" aria-hidden="true"></div>

            {/* Custom Ally Brand Cursor */}
            <Cursor>
              <svg className="size-6 text-primary drop-shadow-lg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                <path
                  fill="currentColor"
                  d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
                />
              </svg>
            </Cursor>

            {children}

            {/* Use dangerouslySetInnerHTML instead of styled-jsx to avoid property 'jsx' errors in standard React types */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
          /* Hide native cursor globally to allow the animated one to take over */
          @media (pointer: fine) {
            * {
              cursor: none !important;
            }
          }
        `,
              }}
            />
          </CursorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
