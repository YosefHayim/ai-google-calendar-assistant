import type { TranslationShape } from './en'

export const he: TranslationShape = {
  // Common/shared strings
  common: {
    loading: 'טוען...',
    error: 'משהו השתבש',
    retry: 'נסה שוב',
    save: 'שמור',
    cancel: 'ביטול',
    confirm: 'אישור',
    close: 'סגור',
    refresh: 'רענן',
    back: 'חזור',
    next: 'הבא',
    submit: 'שלח',
    delete: 'מחק',
    edit: 'ערוך',
    create: 'צור',
    update: 'עדכן',
    search: 'חיפוש',
    noData: 'אין נתונים זמינים',
    comingSoon: 'בקרוב',
    online: 'מחובר',
    offline: 'לא מחובר',
  },

  // Authentication
  auth: {
    signIn: 'התחברות',
    signUp: 'הרשמה',
    signOut: 'התנתקות',
    email: 'אימייל',
    password: 'סיסמה',
    forgotPassword: 'שכחת סיסמה?',
    noAccount: 'אין לך חשבון?',
    haveAccount: 'יש לך כבר חשבון?',
  },

  // Marketing/Navbar
  navbar: {
    home: 'בית',
    about: 'אודות',
    pricing: 'מחירים',
    contact: 'צור קשר',
    login: 'התחברות',
    getStarted: 'התחל עכשיו',
    language: 'שפה',
  },

  // Hero Section
  hero: {
    title: 'המזכירה האישית שלך ליומן גוגל',
    subtitle: 'ספר לי מה אתה צריך בשפה טבעית - אני אטפל בשאר.',
    cta: 'התחל בחינם',
  },

  // Features Section
  features: {
    title: 'איך אלי עוזרת',
    schedule: 'תזמן והגן',
    query: 'שאל על הזמן שלך',
    insights: 'תובנות זמן',
  },

  // Footer
  footer: {
    rights: 'כל הזכויות שמורות.',
    privacy: 'מדיניות פרטיות',
    terms: 'תנאי שימוש',
  },

  // Sidebar Navigation
  sidebar: {
    assistant: 'עוזרת',
    assistantDescription: 'שוחח עם העוזרת החכמה שלך לניהול אירועים ולוחות זמנים',
    analytics: 'אנליטיקס',
    analyticsDescription: 'צפה בתובנות על הקצאת זמן, דפוסי אירועים ומגמות פרודוקטיביות',
    gapRecovery: 'שחזור פערים',
    gapRecoveryDescription: 'גלה ושחזר פערי זמן לא מתועדים ביומן שלך',
    settings: 'הגדרות',
    logout: 'התנתקות',
    chatWithAlly: 'שוחח עם אלי',
    minimize: 'מזער',
  },

  // Dashboard
  dashboard: {
    welcome: 'ברוך שובך',
    today: 'היום',
    tomorrow: 'מחר',
    thisWeek: 'השבוע',
    settings: 'הגדרות',
    analytics: 'אנליטיקס',
    calendars: 'יומנים',
  },

  // Analytics Dashboard
  analytics: {
    title: 'אנליטיקס',
    dateRange: 'טווח תאריכים',
    refresh: 'רענן',
    analyzing: 'מנתח את היומן שלך...',

    // Stats labels
    stats: {
      productivityScore: 'ציון פרודוקטיביות',
      productivityDescription: 'מבוסס על עומס פגישות, זמן ריכוז והתפלגות אירועים',
      meetingLoad: 'עומס פגישות',
      focusTime: 'זמן ריכוז',
      totalEvents: 'סה"כ אירועים',
      daysWithEvents: 'ימים עם אירועים',
      totalHours: 'סה"כ שעות',
      avgPerEvent: 'ממוצע {{value}} שעות לאירוע',
      avgPerDay: 'ממוצע ליום',
      eventsPerDay: 'אירועים ליום',
      peakHour: 'שעת שיא',
      mostScheduledTime: 'הזמן הכי מתוזמן',
      focusBlocks: 'בלוקי ריכוז',
      focusBlocksDescription: 'בלוקים של 2+ שעות זמינים',
      busiestDay: 'היום העמוס ביותר',
      longestEvent: 'האירוע הארוך ביותר',
      longestSingleEvent: 'האירוע הבודד הארוך ביותר',
      freeDays: 'ימים פנויים',
      daysWithoutEvents: 'ימים ללא אירועים',
      allDay: 'כל היום',
      allDayEvents: 'אירועי יום שלם',
      recurring: 'חוזרים',
      recurringEvents: 'אירועים חוזרים',
    },

    // Chart titles and descriptions
    charts: {
      dailyHours: 'שעות זמינות יומיות',
      dailyHoursDescription: 'שעות שנותרו אחרי אירועים מתוזמנים בכל יום.',
      dailyHoursTooltip:
        'מציג את השעות הזמינות שנותרו בכל יום אחרי אירועים מתוזמנים. מבוסס על {{hours}} שעות ערות ביום (בהנחה של ~8 שעות שינה), פחות זמן באירועי יומן.',
      totalAvailable: 'סה"כ זמין',
      dailyAvg: 'ממוצע יומי',

      weeklyPattern: 'דפוס שבועי',
      weeklyPatternDescription: 'ראה איך האירועים שלך מתפלגים לאורך השבוע.',
      weeklyPatternTooltip:
        'מצבר את כל האירועים מטווח התאריכים הנבחר לפי יום בשבוע כדי להציג את הדפוס השבועי הטיפוסי שלך. לחץ על יום כדי לראות את האירועים של אותו יום.',
      totalHours: 'סה"כ שעות',
      totalEventsLabel: 'סה"כ אירועים',

      monthlyPattern: 'דפוס חודשי',
      monthlyPatternDescription: 'איך הזמן שלך מתחלק לאורך החודש.',
      monthlyPatternTooltip:
        "מציג התפלגות אירועים על פני שבועות החודש. שבוע 1 הוא ימים 1-7, שבוע 2 הוא ימים 8-14, וכו'.",

      eventDuration: 'משך אירועים',
      eventDurationDescription: 'פירוט האירועים שלך לפי משך.',
      eventDurationTooltip: 'מקטלג את האירועים שלך לפי משך כדי לעזור לך להבין איך הזמן שלך מוקצה.',

      timeAllocation: 'הקצאת זמן',
      timeAllocationDescription: 'ראה לאן הזמן שלך הולך על פני יומנים שונים.',
      timeAllocationTooltip:
        'מציג איך הזמן המתוזמן שלך מתחלק על פני יומנים שונים. לחץ על יומן כדי לראות את האירועים שלו.',

      timeDistribution: 'התפלגות זמן',
      timeDistributionDescription: 'סקירה ויזואלית של פעילות היומן שלך.',
    },

    // Chart type labels
    chartTypes: {
      bar: 'עמודות',
      line: 'קו',
      area: 'שטח',
      stacked: 'מוערם',
      pie: 'עוגה',
      donut: 'טבעת',
      radar: 'רדאר',
      horizontal: 'אופקי',
      progress: 'התקדמות',
    },

    // Insights
    insights: {
      title: 'תובנות AI',
      loading: 'מייצר תובנות...',
      error: 'לא ניתן לייצר תובנות',
    },

    // Calendar management
    calendars: {
      title: 'היומנים שלך',
      manage: 'נהל יומנים',
      create: 'צור יומן',
      settings: 'הגדרות יומן',
      events: 'אירועים',
      hours: 'שעות',
    },

    // Recent events
    recentEvents: {
      title: 'אירועים אחרונים',
      noEvents: 'אין אירועים אחרונים',
      viewAll: 'הצג הכל',
    },
  },

  // Chat Interface
  chat: {
    placeholder: 'שאל כל דבר על היומן שלך...',
    send: 'שלח',
    recording: 'מקליט...',
    stopRecording: 'עצור הקלטה',
    cancelRecording: 'ביטול',
    startRecording: 'התחל קלט קולי',
    thinking: 'אלי חושבת...',
    emptyState: 'אין הודעות עדיין. התחל שיחה!',
    errorMessage: 'שגיאה בעיבוד הבקשה שלך.',

    // View switcher
    views: {
      chat: "צ'אט",
      avatar: '2D',
      threeDee: '3D',
      threeDeeComingSoon: '3D (בקרוב)',
    },

    // Message actions
    actions: {
      resend: 'איפוס / שלח מחדש',
      edit: 'ערוך ושלח מחדש',
      speak: 'האזן להודעה',
      hearResponse: 'האזן לתשובה',
      copy: 'העתק',
      copied: 'הועתק!',
    },

    // AI Sidebar
    ally: {
      name: 'אלי',
      badge: 'AI',
      online: 'מחוברת',
      chatWith: 'שוחח עם אלי',
    },
  },

  // Gap Recovery
  gaps: {
    title: 'שחזור פערים',
    description: 'גלה זמן לא מתועד ביומן שלך',
    analyzing: 'מנתח את היומן שלך...',

    // Header
    header: {
      found: '{{count}} פערים נמצאו',
      analyzedRange: 'נותח מ-{{start}} עד {{end}}',
      refresh: 'רענן',
      dismissAll: 'בטל הכל',
    },

    // States
    states: {
      loading: 'מנתח את היומן שלך...',
      error: {
        title: 'לא ניתן לטעון פערים',
        description: 'לא הצלחנו לנתח את היומן שלך. אנא נסה שוב.',
        retry: 'נסה שוב',
      },
      empty: {
        title: 'הכל מעודכן!',
        description: 'היומן שלך נראה מאורגן היטב. אלי תודיע לך כשיתגלו פערי זמן חדשים.',
      },
    },

    // Gap card
    card: {
      availableTimeSlot: 'משבצת זמן זמינה',
      betweenEvents: 'בין אירועים',
      freeTime: 'זמן פנוי',
      suggestion: 'ההצעה של אלי',
      scheduleEvent: 'תזמן אירוע',
      skip: 'דלג',
      skipTooltip: 'התעלם מהפער הזה לעת עתה',
    },

    // Confidence levels
    confidence: {
      high: 'ביטחון גבוה',
      highTooltip: 'אלי בטוחה שזהו פער אמיתי בלוח הזמנים שלך',
      medium: 'ביטחון בינוני',
      mediumTooltip: 'זה עשוי להיות זמן פנוי מכוון - בדוק לפני תזמון',
      low: 'ביטחון נמוך',
      lowTooltip: 'זה יכול להיות מכוון - אלי פחות בטוחה לגבי פער זה',
    },

    // Fill dialog
    dialog: {
      title: 'מלא את הפער הזה',
      eventName: 'שם האירוע',
      eventNamePlaceholder: 'הזן שם אירוע',
      description: 'תיאור (אופציונלי)',
      descriptionPlaceholder: 'הוסף תיאור...',
      calendar: 'יומן',
      creating: 'יוצר...',
      create: 'צור אירוע',
    },
  },

  // Settings
  settings: {
    title: 'הגדרות',
    profile: 'פרופיל',
    preferences: 'העדפות',
    notifications: 'התראות',
    integrations: 'אינטגרציות',
    language: 'שפה',
    theme: 'ערכת נושא',
    themeLight: 'בהיר',
    themeDark: 'כהה',
    themeSystem: 'מערכת',
  },

  // Dialogs
  dialogs: {
    eventDetails: {
      title: 'פרטי אירוע',
      noDescription: 'אין תיאור',
      allDay: 'כל היום',
      location: 'מיקום',
      attendees: 'משתתפים',
      calendar: 'יומן',
      openInGoogle: 'פתח ביומן Google',
    },
    dayEvents: {
      title: 'אירועים ב-{{date}}',
      noEvents: 'אין אירועים ביום זה',
      totalHours: '{{hours}} שעות מתוזמנות',
    },
    calendarEvents: {
      title: 'אירועי {{calendar}}',
      totalHours: '{{hours}} שעות סה"כ',
    },
    calendarSettings: {
      title: 'הגדרות יומן',
      color: 'צבע',
      visibility: 'נראות',
      notifications: 'התראות',
    },
    createCalendar: {
      title: 'צור יומן חדש',
      name: 'שם היומן',
      namePlaceholder: 'הזן שם יומן',
      description: 'תיאור',
      descriptionPlaceholder: 'הוסף תיאור...',
      color: 'צבע',
      creating: 'יוצר...',
      create: 'צור יומן',
    },
  },

  // Onboarding
  onboarding: {
    welcome: 'ברוכים הבאים לאלי',
    step1: {
      title: 'הכר את העוזרת שלך',
      description: 'שוחח עם אלי כדי לנהל את היומן שלך בשפה טבעית.',
    },
    step2: {
      title: 'צפה באנליטיקס שלך',
      description: 'קבל תובנות על איך אתה מבלה את הזמן שלך.',
    },
    step3: {
      title: 'שחזר זמן אבוד',
      description: 'מצא ומלא פערים בלוח הזמנים שלך.',
    },
    getStarted: 'התחל',
    skip: 'דלג על הסיור',
    next: 'הבא',
    previous: 'הקודם',
    finish: 'סיום',
  },

  // Time/Date formatting
  time: {
    hours: 'שעות',
    hoursShort: 'ש',
    minutes: 'דקות',
    minutesShort: 'ד',
    days: 'ימים',
    weeks: 'שבועות',
    months: 'חודשים',
  },

  // Days of week
  days: {
    sunday: 'יום ראשון',
    monday: 'יום שני',
    tuesday: 'יום שלישי',
    wednesday: 'יום רביעי',
    thursday: 'יום חמישי',
    friday: 'יום שישי',
    saturday: 'שבת',
    sun: 'א׳',
    mon: 'ב׳',
    tue: 'ג׳',
    wed: 'ד׳',
    thu: 'ה׳',
    fri: 'ו׳',
    sat: 'ש׳',
  },

  // Errors
  errors: {
    generic: 'משהו השתבש. אנא נסה שוב.',
    network: 'שגיאת רשת. אנא בדוק את החיבור שלך.',
    unauthorized: 'אנא התחבר כדי להמשיך.',
    notFound: 'המשאב המבוקש לא נמצא.',
    serverError: 'שגיאת שרת. אנא נסה שוב מאוחר יותר.',
  },
} as const
