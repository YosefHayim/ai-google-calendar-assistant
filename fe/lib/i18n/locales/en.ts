export const en = {
  navbar: {
    home: "Home",
    about: "About",
    pricing: "Pricing",
    contact: "Contact",
    login: "Login",
    getStarted: "Get Started",
    language: "Language",
  },
  hero: {
    title: "Your AI Secretary for Google Calendar",
    subtitle:
      "Tell me what you need in plain language - I will handle the rest.",
    cta: "Get Started Free",
  },
  features: {
    title: "How Ally Helps",
    schedule: "Schedule & Protect",
    query: "Query Your Time",
    insights: "Time Insights",
  },
  footer: {
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
  },
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
  },
  dashboard: {
    welcome: "Welcome back",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    settings: "Settings",
    analytics: "Analytics",
    calendars: "Calendars",
  },
} as const;

export type TranslationKeys = typeof en;
