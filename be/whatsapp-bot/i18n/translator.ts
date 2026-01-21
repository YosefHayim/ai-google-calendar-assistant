import i18next, { type i18n, type TFunction } from "i18next";
import type { SupportedLocale, TextDirection } from "./config";
import {
  DEFAULT_LOCALE,
  getDirection,
  getLocaleFromLanguageCode,
  I18N_RESOURCES,
  SUPPORTED_LOCALES,
} from "./config";

const I18N_INIT_CONFIG = {
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  debug: false,
  interpolation: { escapeValue: false },
  resources: I18N_RESOURCES,
} as const;

let i18nInstance: i18n | null = null;

export async function initI18n(): Promise<i18n> {
  if (i18nInstance) {
    return i18nInstance;
  }

  i18nInstance = i18next.createInstance();
  await i18nInstance.init(I18N_INIT_CONFIG);
  return i18nInstance;
}

export function initI18nSync(): i18n {
  if (i18nInstance) {
    return i18nInstance;
  }

  i18nInstance = i18next.createInstance();
  i18nInstance.init({ ...I18N_INIT_CONFIG, initAsync: false });
  return i18nInstance;
}

export function getI18nInstance(): i18n {
  if (!i18nInstance) {
    return initI18nSync();
  }
  return i18nInstance;
}

export type I18nTranslator = {
  t: TFunction;
  locale: SupportedLocale;
  direction: TextDirection;
};

export function getTranslator(locale: SupportedLocale): I18nTranslator {
  const instance = getI18nInstance();
  return {
    t: instance.getFixedT(locale),
    locale,
    direction: getDirection(locale),
  };
}

export function getTranslatorFromLanguageCode(
  languageCode: string | undefined
): I18nTranslator {
  return getTranslator(getLocaleFromLanguageCode(languageCode));
}

export function createTranslator(locale: SupportedLocale): I18nTranslator {
  return getTranslator(locale);
}
