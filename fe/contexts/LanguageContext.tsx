"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  type SupportedLanguageCode,
} from "@/lib/i18n";
import "@/lib/i18n/config";

interface LanguageContextValue {
  currentLanguage: SupportedLanguageCode;
  changeLanguage: (code: SupportedLanguageCode) => void;
  languages: typeof SUPPORTED_LANGUAGES;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguageCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const validLanguage = SUPPORTED_LANGUAGES.find(
      (lang) => lang.code === stored
    );
    if (validLanguage) {
      setCurrentLanguage(validLanguage.code);
      i18n.changeLanguage(validLanguage.code);
    } else {
      setCurrentLanguage(i18n.language as SupportedLanguageCode);
    }
  }, [i18n]);

  const changeLanguage = useCallback(
    (code: SupportedLanguageCode) => {
      const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
      if (lang) {
        i18n.changeLanguage(code);
        setCurrentLanguage(code);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, code);

        const htmlEl = document.documentElement;
        htmlEl.lang = code;
        htmlEl.dir = lang.dir;
      }
    },
    [i18n]
  );

  const isRTL = useMemo(() => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
    return lang?.dir === "rtl";
  }, [currentLanguage]);

  const value = useMemo(
    () => ({
      currentLanguage,
      changeLanguage,
      languages: SUPPORTED_LANGUAGES,
      isRTL,
    }),
    [currentLanguage, changeLanguage, isRTL]
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
