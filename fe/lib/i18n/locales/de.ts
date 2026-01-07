import type { TranslationShape } from './en'

export const de: TranslationShape = {
  common: {
    loading: 'Laden...',
    error: 'Etwas ist schief gelaufen',
    retry: 'Erneut versuchen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    close: 'Schließen',
    refresh: 'Aktualisieren',
    back: 'Zurück',
    next: 'Weiter',
    submit: 'Absenden',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    create: 'Erstellen',
    update: 'Aktualisieren',
    search: 'Suchen',
    noData: 'Keine Daten verfügbar',
    comingSoon: 'Demnächst',
    online: 'Online',
    offline: 'Offline',
  },

  auth: {
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    signOut: 'Abmelden',
    email: 'E-Mail',
    password: 'Passwort',
    forgotPassword: 'Passwort vergessen?',
    noAccount: 'Noch kein Konto?',
    haveAccount: 'Bereits ein Konto?',
  },

  navbar: {
    home: 'Startseite',
    about: 'Über uns',
    pricing: 'Preise',
    contact: 'Kontakt',
    login: 'Anmelden',
    getStarted: 'Loslegen',
    language: 'Sprache',
  },

  hero: {
    title: 'Ihr KI-Sekretär für Google Kalender',
    subtitle: 'Sagen Sie mir, was Sie brauchen - ich kümmere mich um den Rest.',
    cta: 'Kostenlos starten',
  },

  features: {
    title: 'Wie Ally hilft',
    schedule: 'Planen und schützen',
    query: 'Zeit verwalten',
    insights: 'Zeit-Einblicke',
  },

  footer: {
    rights: 'Alle Rechte vorbehalten.',
    privacy: 'Datenschutzrichtlinie',
    terms: 'Nutzungsbedingungen',
  },

  sidebar: {
    assistant: 'Assistent',
    assistantDescription: 'Chatten Sie mit Ihrem KI-Assistenten um Termine und Zeitpläne zu verwalten',
    analytics: 'Analytik',
    analyticsDescription: 'Sehen Sie Einblicke zur Zeitverteilung, Terminmustern und Produktivitätstrends',
    gapRecovery: 'Lückenwiederherstellung',
    gapRecoveryDescription: 'Entdecken und nutzen Sie ungenutzte Zeitlücken in Ihrem Kalender',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    chatWithAlly: 'Mit Ally chatten',
    minimize: 'Minimieren',
  },

  dashboard: {
    welcome: 'Willkommen zurück',
    today: 'Heute',
    tomorrow: 'Morgen',
    thisWeek: 'Diese Woche',
    settings: 'Einstellungen',
    analytics: 'Analytik',
    calendars: 'Kalender',
  },

  analytics: {
    title: 'Analytik',
    dateRange: 'Zeitraum',
    refresh: 'Aktualisieren',
    analyzing: 'Analysiere Ihren Kalender...',

    stats: {
      productivityScore: 'Produktivitätswert',
      productivityDescription: 'Basierend auf Meeting-Last, Fokuszeit und Terminverteilung',
      meetingLoad: 'Meeting-Last',
      focusTime: 'Fokuszeit',
      totalEvents: 'Termine gesamt',
      daysWithEvents: 'Tage mit Terminen',
      totalHours: 'Stunden gesamt',
      avgPerEvent: 'Durchschn. {{value}}h pro Termin',
      avgPerDay: 'Durchschn./Tag',
      eventsPerDay: 'Termine pro Tag',
      peakHour: 'Spitzenstunde',
      mostScheduledTime: 'meistgeplante Zeit',
      focusBlocks: 'Fokus-Blöcke',
      focusBlocksDescription: '2+ Stunden-Blöcke verfügbar',
      busiestDay: 'Arbeitsreichster Tag',
      longestEvent: 'Längster Termin',
      longestSingleEvent: 'längster einzelner Termin',
      freeDays: 'Freie Tage',
      daysWithoutEvents: 'Tage ohne Termine',
      allDay: 'Ganztägig',
      allDayEvents: 'ganztägige Termine',
      recurring: 'Wiederkehrend',
      recurringEvents: 'wiederkehrende Termine',
    },

    charts: {
      dailyHours: 'Tägliche verfügbare Stunden',
      dailyHoursDescription: 'Nach geplanten Terminen verbleibende Stunden pro Tag.',
      dailyHoursTooltip:
        'Zeigt Ihre verbleibenden verfügbaren Stunden pro Tag nach geplanten Terminen. Basierend auf {{hours}} Wachstunden pro Tag (ca. 8 Stunden Schlaf), minus Zeit in Kalenderterminen.',
      totalAvailable: 'Gesamt verfügbar',
      dailyAvg: 'Täglicher Durchschn.',

      weeklyPattern: 'Wochenmuster',
      weeklyPatternDescription: 'Sehen Sie, wie Ihre Termine über die Woche verteilt sind.',
      weeklyPatternTooltip:
        'Aggregiert alle Termine aus dem ausgewählten Zeitraum nach Wochentag, um Ihr typisches Wochenmuster zu zeigen. Klicken Sie auf einen Tag, um die Termine dieses Tages zu sehen.',
      totalHours: 'Stunden gesamt',
      totalEventsLabel: 'Termine gesamt',

      monthlyPattern: 'Monatsmuster',
      monthlyPatternDescription: 'Wie Ihre Zeit über den Monat verteilt ist.',
      monthlyPatternTooltip:
        'Zeigt die Terminverteilung über die Wochen des Monats. Woche 1 = Tage 1-7, Woche 2 = Tage 8-14, usw.',

      eventDuration: 'Termindauer',
      eventDurationDescription: 'Aufschlüsselung Ihrer Termine nach Dauer.',
      eventDurationTooltip: 'Kategorisiert Ihre Termine nach Dauer, um Ihnen bei der Zeitverteilung zu helfen.',

      timeAllocation: 'Zeitverteilung',
      timeAllocationDescription: 'Sehen Sie, wohin Ihre Zeit über verschiedene Kalender geht.',
      timeAllocationTooltip:
        'Zeigt, wie Ihre geplante Zeit auf verschiedene Kalender verteilt ist. Klicken Sie auf einen Kalender, um seine Termine zu sehen.',

      timeDistribution: 'Zeitverteilung',
      timeDistributionDescription: 'Visuelle Übersicht Ihrer Kalenderaktivität.',
    },

    chartTypes: {
      bar: 'Balken',
      line: 'Linie',
      area: 'Fläche',
      stacked: 'Gestapelt',
      pie: 'Kreisdiagramm',
      donut: 'Ringdiagramm',
      radar: 'Radar',
      horizontal: 'Horizontal',
      progress: 'Fortschritt',
    },

    insights: {
      title: 'KI-Einblicke',
      loading: 'Generiere Einblicke...',
      error: 'Einblicke konnten nicht generiert werden',
    },

    calendars: {
      title: 'Ihre Kalender',
      manage: 'Kalender verwalten',
      create: 'Kalender erstellen',
      settings: 'Kalendereinstellungen',
      events: 'Termine',
      hours: 'Stunden',
    },

    recentEvents: {
      title: 'Letzte Termine',
      noEvents: 'Keine aktuellen Termine',
      viewAll: 'Alle anzeigen',
    },
  },

  chat: {
    placeholder: 'Fragen Sie etwas zu Ihrem Kalender...',
    send: 'Senden',
    recording: 'Aufnahme...',
    stopRecording: 'Aufnahme stoppen',
    cancelRecording: 'Abbrechen',
    startRecording: 'Spracheingabe starten',
    thinking: 'Ally denkt nach...',
    emptyState: 'Noch keine Nachrichten. Beginnen Sie ein Gespräch!',
    errorMessage: 'Fehler bei der Verarbeitung Ihrer Anfrage.',

    views: {
      chat: 'Chat',
      avatar: '2D',
      threeDee: '3D',
      threeDeeComingSoon: '3D (Demnächst)',
    },

    actions: {
      resend: 'Zurücksetzen / Erneut senden',
      edit: 'Bearbeiten und senden',
      speak: 'Nachricht anhören',
      hearResponse: 'Antwort anhören',
      copy: 'Kopieren',
      copied: 'Kopiert!',
    },

    ally: {
      name: 'Ally',
      badge: 'KI',
      online: 'Online',
      chatWith: 'Mit Ally chatten',
    },
  },

  gaps: {
    title: 'Lückenwiederherstellung',
    description: 'Entdecken Sie ungenutzte Zeit in Ihrem Kalender',
    analyzing: 'Analysiere Ihren Kalender...',

    header: {
      found: '{{count}} Lücken gefunden',
      analyzedRange: 'Analysiert von {{start}} bis {{end}}',
      refresh: 'Aktualisieren',
      dismissAll: 'Alle verwerfen',
    },

    states: {
      loading: 'Analysiere Ihren Kalender...',
      error: {
        title: 'Lücken konnten nicht geladen werden',
        description: 'Wir konnten Ihren Kalender nicht analysieren. Bitte versuchen Sie es erneut.',
        retry: 'Erneut versuchen',
      },
      empty: {
        title: 'Alles aktuell!',
        description:
          'Ihr Kalender sieht gut organisiert aus. Ally benachrichtigt Sie, wenn neue Zeitlücken erkannt werden.',
      },
    },

    card: {
      availableTimeSlot: 'Verfügbarer Zeitslot',
      betweenEvents: 'Zwischen Terminen',
      freeTime: 'Freie Zeit',
      suggestion: 'Allys Vorschlag',
      scheduleEvent: 'Termin planen',
      skip: 'Überspringen',
      skipTooltip: 'Diese Lücke vorerst ignorieren',
    },

    confidence: {
      high: 'Hohe Sicherheit',
      highTooltip: 'Ally ist sicher, dass dies eine echte Lücke in Ihrem Zeitplan ist',
      medium: 'Mittlere Sicherheit',
      mediumTooltip: 'Dies könnte beabsichtigte Freizeit sein - vor dem Planen prüfen',
      low: 'Geringe Sicherheit',
      lowTooltip: 'Dies könnte beabsichtigt sein - Ally ist sich bei dieser Lücke weniger sicher',
    },

    dialog: {
      title: 'Diese Lücke füllen',
      eventName: 'Terminname',
      eventNamePlaceholder: 'Terminname eingeben',
      description: 'Beschreibung (optional)',
      descriptionPlaceholder: 'Beschreibung hinzufügen...',
      calendar: 'Kalender',
      creating: 'Erstelle...',
      create: 'Termin erstellen',
    },
  },

  settings: {
    title: 'Einstellungen',
    profile: 'Profil',
    preferences: 'Präferenzen',
    notifications: 'Benachrichtigungen',
    integrations: 'Integrationen',
    language: 'Sprache',
    theme: 'Design',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeSystem: 'System',
  },

  dialogs: {
    eventDetails: {
      title: 'Termindetails',
      noDescription: 'Keine Beschreibung',
      allDay: 'Ganztägig',
      location: 'Ort',
      attendees: 'Teilnehmer',
      calendar: 'Kalender',
      openInGoogle: 'In Google Kalender öffnen',
    },
    dayEvents: {
      title: 'Termine am {{date}}',
      noEvents: 'Keine Termine an diesem Tag',
      totalHours: '{{hours}} Stunden geplant',
    },
    calendarEvents: {
      title: 'Termine von {{calendar}}',
      totalHours: '{{hours}} Stunden gesamt',
    },
    calendarSettings: {
      title: 'Kalendereinstellungen',
      color: 'Farbe',
      visibility: 'Sichtbarkeit',
      notifications: 'Benachrichtigungen',
    },
    createCalendar: {
      title: 'Neuen Kalender erstellen',
      name: 'Kalendername',
      namePlaceholder: 'Kalendernamen eingeben',
      description: 'Beschreibung',
      descriptionPlaceholder: 'Beschreibung hinzufügen...',
      color: 'Farbe',
      creating: 'Erstelle...',
      create: 'Kalender erstellen',
    },
  },

  onboarding: {
    welcome: 'Willkommen bei Ally',
    step1: {
      title: 'Lernen Sie Ihren Assistenten kennen',
      description: 'Chatten Sie mit Ally, um Ihren Kalender in natürlicher Sprache zu verwalten.',
    },
    step2: {
      title: 'Sehen Sie Ihre Analytik',
      description: 'Erhalten Sie Einblicke, wie Sie Ihre Zeit verbringen.',
    },
    step3: {
      title: 'Verlorene Zeit wiederherstellen',
      description: 'Finden und füllen Sie Lücken in Ihrem Zeitplan.',
    },
    getStarted: 'Loslegen',
    skip: 'Tour überspringen',
    next: 'Weiter',
    previous: 'Zurück',
    finish: 'Fertig',
  },

  time: {
    hours: 'Stunden',
    hoursShort: 'h',
    minutes: 'Minuten',
    minutesShort: 'm',
    days: 'Tage',
    weeks: 'Wochen',
    months: 'Monate',
  },

  days: {
    sunday: 'Sonntag',
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sun: 'So',
    mon: 'Mo',
    tue: 'Di',
    wed: 'Mi',
    thu: 'Do',
    fri: 'Fr',
    sat: 'Sa',
  },

  errors: {
    generic: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
    network: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
    unauthorized: 'Bitte melden Sie sich an, um fortzufahren.',
    notFound: 'Die angeforderte Ressource wurde nicht gefunden.',
    serverError: 'Serverfehler. Bitte versuchen Sie es später erneut.',
  },
} as const
