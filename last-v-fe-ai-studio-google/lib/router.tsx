
'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';

const RouterContext = createContext({
  pathname: '/',
  push: (path: string) => { console.warn('Router not initialized'); },
});

export const usePathname = () => {
  const context = useContext(RouterContext);
  return context.pathname;
};

export const useRouter = () => {
  const { push } = useContext(RouterContext);
  return { push };
};

// Updated Link to properly handle and bubble onClick events
export const Link = ({ href, children, className, ...props }: { href: string, children?: ReactNode, className?: string, [key: string]: any }) => {
  const { push } = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If a custom onClick handler is provided, execute it first
    if (props.onClick) {
      props.onClick(e);
    }

    // Basic check for external links - don't intercept these
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    // Standard SPA navigation logic
    e.preventDefault();
    if (href !== pathname) {
      push(href);
    }
  };
  
  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export const RouterProvider = ({ children }: { children?: ReactNode }) => {
  const [pathname, setPathname] = useState(() => {
    try {
      return window.location.pathname || '/';
    } catch {
      return '/';
    }
  });

  useEffect(() => {
    const handlePopState = () => {
      try {
        setPathname(window.location.pathname || '/');
      } catch {
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const push = (path: string) => {
    try {
      const isBlob = window.location.protocol === 'blob:';
      if (!isBlob) {
        window.history.pushState({}, '', path);
      }
    } catch (error) {
      console.warn('Router: pushState navigation suppressed due to environment restrictions. Falling back to internal state.', error);
    }
    setPathname(path);
  };

  return (
    <RouterContext.Provider value={{ pathname, push }}>
      {children}
    </RouterContext.Provider>
  );
};
