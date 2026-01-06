export type SupportedLocale = "en" | "he"

export type TextDirection = "ltr" | "rtl"

export type TranslatedListItem = {
  bullet?: "dot" | "none" | "emoji"
  bulletEmoji?: string
  text: string
  emphasis?: boolean
}

export type TranslatedSection = {
  emoji: string
  title: string
  items: TranslatedListItem[]
}

export type CommandTranslations = {
  start: {
    header: string
    welcomeText: string
    sections: TranslatedSection[]
    footer: string
  }
  help: {
    header: string
    description: string
    sections: TranslatedSection[]
    naturalLanguageTip: string
    footerTip: string
  }
  usage: {
    header: string
    sections: TranslatedSection[]
  }
  exit: {
    header: string
    text: string
    footer: string
  }

  today: {
    header: string
    text: string
    footerTip: string
  }
  tomorrow: {
    header: string
    text: string
    footerTip: string
  }
  week: {
    header: string
    text: string
    footerTip: string
  }
  month: {
    header: string
    text: string
    footerTip: string
  }
  free: {
    header: string
    text: string
    alsoAskText: string
    suggestions: string[]
  }
  busy: {
    header: string
    text: string
    footerTip: string
  }

  quick: {
    header: string
    text: string
    examples: string[]
    footer: string
  }
  create: {
    header: string
    text: string
    sections: TranslatedSection[]
    footerTip: string
  }
  update: {
    header: string
    text: string
    sections: TranslatedSection[]
    footerTip: string
  }
  delete: {
    header: string
    text: string
    sections: TranslatedSection[]
    footerWarning: string
  }
  cancel: {
    header: string
    text: string
    examples: string[]
    footer: string
  }
  search: {
    header: string
    text: string
    sections: TranslatedSection[]
    footerTip: string
  }
  remind: {
    header: string
    text: string
    examples: string[]
    footer: string
  }

  analytics: {
    header: string
    text: string
    sections: TranslatedSection[]
    footerTip: string
  }
  calendars: {
    header: string
    text: string
    footerTip: string
  }

  status: {
    header: string
    text: string
    checkingItems: string[]
    footerTip: string
  }
  settings: {
    header: string
    connectedAsText: string
    sections: TranslatedSection[]
    footerText: string
    buttons: {
      changeEmail: string
      reconnectGoogle: string
    }
  }
  changeEmail: {
    notAuthenticatedError: string
    currentEmailText: string
    enterNewEmailPrompt: string
  }
  feedback: {
    header: string
    text: string
    options: string[]
    instructionText: string
    footer: string
  }

  language: {
    header: string
    currentLanguageText: string
    selectPrompt: string
    changedText: string
    languages: Record<SupportedLocale, string>
  }
}

export type AuthTranslations = {
  welcomePrompt: string
  enterOtpPrompt: string
  otpExpired: string
  otpInvalidError: string
  otpInvalidWithNewEmail: string
  emailVerifiedSuccess: string
  dbSaveError: string
  enterOtpOrNewEmail: string
  otpSentToNewEmail: string
  otpSendFailed: string
}

export type ErrorTranslations = {
  processingError: string
  noOutputFromAgent: string
  eventCreationError: string
  confirmationError: string
  pendingEventPrompt: string
  processingPreviousRequest: string
}

export type CommonTranslations = {
  confirm: string
  cancel: string
  yes: string
  no: string
  eventCreationCancelled: string
  typeExitToStop: string
}

export type BotMenuTranslations = {
  today: string
  tomorrow: string
  week: string
  month: string
  free: string
  busy: string
  create: string
  update: string
  delete: string
  search: string
  analytics: string
  calendars: string
  status: string
  settings: string
  help: string
  feedback: string
  exit: string
  language: string
}

export type LocaleTranslations = {
  commands: CommandTranslations
  auth: AuthTranslations
  errors: ErrorTranslations
  common: CommonTranslations
  botMenu: BotMenuTranslations
}

export type Translator = {
  locale: SupportedLocale
  direction: TextDirection
  translations: LocaleTranslations
}
