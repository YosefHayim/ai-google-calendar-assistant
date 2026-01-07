import type { TranslationShape } from './en'

export const fr: TranslationShape = {
  common: {
    loading: 'Chargement...',
    error: "Une erreur s'est produite",
    retry: 'Réessayer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    close: 'Fermer',
    refresh: 'Actualiser',
    back: 'Retour',
    next: 'Suivant',
    submit: 'Soumettre',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    update: 'Mettre à jour',
    search: 'Rechercher',
    noData: 'Aucune donnée disponible',
    comingSoon: 'Bientôt disponible',
    online: 'En ligne',
    offline: 'Hors ligne',
  },

  auth: {
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    signOut: 'Se déconnecter',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: 'Pas encore de compte ?',
    haveAccount: 'Déjà un compte ?',
  },

  navbar: {
    home: 'Accueil',
    about: 'À propos',
    pricing: 'Tarifs',
    contact: 'Contact',
    login: 'Connexion',
    getStarted: 'Commencer',
    language: 'Langue',
  },

  hero: {
    title: 'Votre secrétaire IA pour Google Agenda',
    subtitle: 'Dites-moi ce dont vous avez besoin en langage naturel - je me charge du reste.',
    cta: 'Commencer gratuitement',
  },

  features: {
    title: 'Comment Ally vous aide',
    schedule: 'Planifiez et protégez',
    query: 'Gérez votre temps',
    insights: 'Analyses du temps',
  },

  footer: {
    rights: 'Tous droits réservés.',
    privacy: 'Politique de confidentialité',
    terms: "Conditions d'utilisation",
  },

  sidebar: {
    assistant: 'Assistant',
    assistantDescription: 'Discutez avec votre assistant IA pour gérer événements et emplois du temps',
    analytics: 'Analytiques',
    analyticsDescription:
      "Consultez les analyses de répartition du temps, les tendances d'événements et la productivité",
    gapRecovery: 'Récupération des créneaux',
    gapRecoveryDescription: 'Découvrez et récupérez les créneaux non suivis dans votre agenda',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    chatWithAlly: 'Discuter avec Ally',
    minimize: 'Réduire',
  },

  dashboard: {
    welcome: 'Bon retour',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    settings: 'Paramètres',
    analytics: 'Analytiques',
    calendars: 'Calendriers',
  },

  analytics: {
    title: 'Analytiques',
    dateRange: 'Plage de dates',
    refresh: 'Actualiser',
    analyzing: 'Analyse de votre agenda...',

    stats: {
      productivityScore: 'Score de productivité',
      productivityDescription:
        'Basé sur la charge de réunions, le temps de concentration et la distribution des événements',
      meetingLoad: 'Charge de réunions',
      focusTime: 'Temps de concentration',
      totalEvents: 'Total événements',
      daysWithEvents: 'jours avec événements',
      totalHours: 'Total heures',
      avgPerEvent: 'Moy. {{value}}H par événement',
      avgPerDay: 'Moy./Jour',
      eventsPerDay: 'événements par jour',
      peakHour: 'Heure de pointe',
      mostScheduledTime: 'heure la plus planifiée',
      focusBlocks: 'Blocs de concentration',
      focusBlocksDescription: 'blocs de 2+ heures disponibles',
      busiestDay: 'Jour le plus chargé',
      longestEvent: 'Événement le plus long',
      longestSingleEvent: 'événement le plus long',
      freeDays: 'Jours libres',
      daysWithoutEvents: 'jours sans événements',
      allDay: 'Journée entière',
      allDayEvents: 'événements journée entière',
      recurring: 'Récurrents',
      recurringEvents: 'événements récurrents',
    },

    charts: {
      dailyHours: 'Heures disponibles quotidiennes',
      dailyHoursDescription: 'Heures restantes après les événements planifiés chaque jour.',
      dailyHoursTooltip:
        "Affiche vos heures disponibles restantes chaque jour après les événements planifiés. Basé sur {{hours}} heures d'éveil par jour (environ 8 heures de sommeil), moins le temps en événements.",
      totalAvailable: 'Total disponible',
      dailyAvg: 'Moy. quotidienne',

      weeklyPattern: 'Schéma hebdomadaire',
      weeklyPatternDescription: 'Voyez comment vos événements sont répartis sur la semaine.',
      weeklyPatternTooltip:
        'Agrège tous les événements de la plage de dates sélectionnée par jour de la semaine pour montrer votre schéma hebdomadaire typique. Cliquez sur un jour pour voir les événements de ce jour.',
      totalHours: 'Total heures',
      totalEventsLabel: 'Total événements',

      monthlyPattern: 'Schéma mensuel',
      monthlyPatternDescription: 'Comment votre temps est réparti tout au long du mois.',
      monthlyPatternTooltip:
        'Affiche la distribution des événements sur les semaines du mois. Semaine 1 = jours 1-7, Semaine 2 = jours 8-14, etc.',

      eventDuration: 'Durée des événements',
      eventDurationDescription: 'Répartition de vos événements par durée.',
      eventDurationTooltip:
        'Catégorise vos événements par durée pour vous aider à comprendre la répartition de votre temps.',

      timeAllocation: 'Répartition du temps',
      timeAllocationDescription: 'Voyez où va votre temps entre les différents calendriers.',
      timeAllocationTooltip:
        'Affiche comment votre temps planifié est réparti entre les différents calendriers. Cliquez sur un calendrier pour voir ses événements.',

      timeDistribution: 'Distribution du temps',
      timeDistributionDescription: "Aperçu visuel de l'activité de votre agenda.",
    },

    chartTypes: {
      bar: 'Barres',
      line: 'Ligne',
      area: 'Zone',
      stacked: 'Empilé',
      pie: 'Camembert',
      donut: 'Anneau',
      radar: 'Radar',
      horizontal: 'Horizontal',
      progress: 'Progression',
    },

    insights: {
      title: 'Analyses IA',
      loading: 'Génération des analyses...',
      error: 'Impossible de générer les analyses',
    },

    calendars: {
      title: 'Vos calendriers',
      manage: 'Gérer les calendriers',
      create: 'Créer un calendrier',
      settings: 'Paramètres du calendrier',
      events: 'événements',
      hours: 'heures',
    },

    recentEvents: {
      title: 'Événements récents',
      noEvents: 'Aucun événement récent',
      viewAll: 'Voir tout',
    },
  },

  chat: {
    placeholder: "Posez n'importe quelle question sur votre agenda...",
    send: 'Envoyer',
    recording: 'Enregistrement...',
    stopRecording: "Arrêter l'enregistrement",
    cancelRecording: 'Annuler',
    startRecording: 'Démarrer la saisie vocale',
    thinking: 'Ally réfléchit...',
    emptyState: 'Pas encore de messages. Commencez une conversation !',
    errorMessage: 'Erreur lors du traitement de votre demande.',

    views: {
      chat: 'Chat',
      avatar: '2D',
      threeDee: '3D',
      threeDeeComingSoon: '3D (Bientôt)',
    },

    actions: {
      resend: 'Réinitialiser / Renvoyer',
      edit: 'Modifier et renvoyer',
      speak: 'Écouter le message',
      hearResponse: 'Écouter la réponse',
      copy: 'Copier',
      copied: 'Copié !',
    },

    ally: {
      name: 'Ally',
      badge: 'IA',
      online: 'En ligne',
      chatWith: 'Discuter avec Ally',
    },
  },

  gaps: {
    title: 'Récupération des créneaux',
    description: 'Découvrez le temps non suivi dans votre agenda',
    analyzing: 'Analyse de votre agenda...',

    header: {
      found: '{{count}} créneaux trouvés',
      analyzedRange: 'Analysé du {{start}} au {{end}}',
      refresh: 'Actualiser',
      dismissAll: 'Tout ignorer',
    },

    states: {
      loading: 'Analyse de votre agenda...',
      error: {
        title: 'Impossible de charger les créneaux',
        description: "Nous n'avons pas pu analyser votre agenda. Veuillez réessayer.",
        retry: 'Réessayer',
      },
      empty: {
        title: 'Tout est à jour !',
        description:
          'Votre agenda semble bien organisé. Ally vous notifiera quand de nouveaux créneaux seront détectés.',
      },
    },

    card: {
      availableTimeSlot: 'Créneau disponible',
      betweenEvents: 'Entre les événements',
      freeTime: 'Temps libre',
      suggestion: "Suggestion d'Ally",
      scheduleEvent: 'Planifier un événement',
      skip: 'Ignorer',
      skipTooltip: 'Ignorer ce créneau pour le moment',
    },

    confidence: {
      high: 'Confiance élevée',
      highTooltip: "Ally est confiant que c'est un vrai créneau dans votre emploi du temps",
      medium: 'Confiance moyenne',
      mediumTooltip: 'Ce pourrait être du temps libre intentionnel - vérifiez avant de planifier',
      low: 'Confiance faible',
      lowTooltip: 'Ce pourrait être intentionnel - Ally est moins sûr de ce créneau',
    },

    dialog: {
      title: 'Remplir ce créneau',
      eventName: "Nom de l'événement",
      eventNamePlaceholder: "Entrez le nom de l'événement",
      description: 'Description (optionnel)',
      descriptionPlaceholder: 'Ajouter une description...',
      calendar: 'Calendrier',
      creating: 'Création...',
      create: 'Créer événement',
    },
  },

  settings: {
    title: 'Paramètres',
    profile: 'Profil',
    preferences: 'Préférences',
    notifications: 'Notifications',
    integrations: 'Intégrations',
    language: 'Langue',
    theme: 'Thème',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    themeSystem: 'Système',
  },

  dialogs: {
    eventDetails: {
      title: "Détails de l'événement",
      noDescription: 'Aucune description',
      allDay: 'Journée entière',
      location: 'Lieu',
      attendees: 'Participants',
      calendar: 'Calendrier',
      openInGoogle: 'Ouvrir dans Google Agenda',
    },
    dayEvents: {
      title: 'Événements du {{date}}',
      noEvents: 'Aucun événement ce jour',
      totalHours: '{{hours}} heures planifiées',
    },
    calendarEvents: {
      title: 'Événements de {{calendar}}',
      totalHours: '{{hours}} heures au total',
    },
    calendarSettings: {
      title: 'Paramètres du calendrier',
      color: 'Couleur',
      visibility: 'Visibilité',
      notifications: 'Notifications',
    },
    createCalendar: {
      title: 'Créer un nouveau calendrier',
      name: 'Nom du calendrier',
      namePlaceholder: 'Entrez le nom du calendrier',
      description: 'Description',
      descriptionPlaceholder: 'Ajouter une description...',
      color: 'Couleur',
      creating: 'Création...',
      create: 'Créer calendrier',
    },
  },

  onboarding: {
    welcome: 'Bienvenue sur Ally',
    step1: {
      title: 'Rencontrez votre assistant',
      description: 'Discutez avec Ally pour gérer votre agenda en langage naturel.',
    },
    step2: {
      title: 'Consultez vos analyses',
      description: 'Obtenez des insights sur la façon dont vous passez votre temps.',
    },
    step3: {
      title: 'Récupérez le temps perdu',
      description: 'Trouvez et remplissez les créneaux dans votre emploi du temps.',
    },
    getStarted: 'Commencer',
    skip: 'Passer la visite',
    next: 'Suivant',
    previous: 'Précédent',
    finish: 'Terminer',
  },

  time: {
    hours: 'heures',
    hoursShort: 'h',
    minutes: 'minutes',
    minutesShort: 'm',
    days: 'jours',
    weeks: 'semaines',
    months: 'mois',
  },

  days: {
    sunday: 'Dimanche',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sun: 'Dim',
    mon: 'Lun',
    tue: 'Mar',
    wed: 'Mer',
    thu: 'Jeu',
    fri: 'Ven',
    sat: 'Sam',
  },

  errors: {
    generic: "Une erreur s'est produite. Veuillez réessayer.",
    network: 'Erreur réseau. Vérifiez votre connexion.',
    unauthorized: 'Veuillez vous connecter pour continuer.',
    notFound: 'La ressource demandée est introuvable.',
    serverError: 'Erreur serveur. Veuillez réessayer plus tard.',
  },
} as const
