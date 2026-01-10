import { afterEach, mock } from "bun:test";

// Mock window and document if they don't exist (for Node-like environment)
if (typeof window === "undefined") {
  // @ts-ignore
  globalThis.window = {
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    location: {
      href: "",
      pathname: "/",
      search: "",
      hash: "",
    } as unknown as Location,
    navigator: {
      userAgent: "test",
    } as unknown as Navigator,
  };
}

if (typeof document === "undefined") {
  // @ts-ignore
  globalThis.document = {
    createElement: () => ({} as unknown as HTMLElement),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [] as unknown as NodeListOf<Element>,
    body: {} as unknown as HTMLElement,
  };
}

// Mock ResizeObserver
if (typeof ResizeObserver === "undefined") {
  // @ts-ignore
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock IntersectionObserver
if (typeof IntersectionObserver === "undefined") {
  // @ts-ignore
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock Next.js router
mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Suppress console errors/warnings in tests unless DEBUG is set
if (!process.env.TEST_DEBUG) {
  console.error = () => {};
  console.warn = () => {};
}
