import React from 'react';
import { createRoot } from 'react-dom/client';

// Shim process.env for browser environment compatibility before other imports
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { NEXT_PUBLIC_API_URL: '' } };
}

import { RouterProvider } from './lib/router';
import App from './App';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RouterProvider>
              <App />
            </RouterProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}