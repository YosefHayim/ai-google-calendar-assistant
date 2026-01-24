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
    dismiss: 'סגור',
    online: 'מחובר',
    offline: 'לא מחובר',
    event: 'אירוע',
    events: 'אירועים',
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
    product: 'מוצר',
    pricing: 'מחירים',
    executivePower: 'כוח מנהלים',
    company: 'חברה',
    aboutUs: 'אודותינו',
    careers: 'קריירה',
    resources: 'משאבים',
    blog: 'בלוג',
    changeLog: 'יומן שינויים',
    description:
      'עוזרת AI ברמת מנהלים שתוכננה לבעלי עסקים להגן על עבודתם העמוקה. מגישה חינמית ועד לכוח מנהלים בלתי מוגבל. בנויה על פרוטוקול Ally Neural.',
    systemOnline: 'כל המערכות פעילות',
    systemOffline: 'המערכת אינה זמינה',
    systemChecking: 'בודק סטטוס...',
    chatOnTelegram: 'שוחח עם אלי בטלגרם',
    checkingServices: 'בודק שירותים...',
    serverUnreachable: 'השרת אינו נגיש',
    serverOnline: 'השרת פעיל',
    uptime: 'זמן פעילות',
    websockets: 'WebSockets',
    connections: 'חיבורים',
    telegram: 'טלגרם',
    slack: 'Slack',
  },

  // Home Page
  home: {
    badge: 'ניהול יומן מונע AI',
    title: 'המזכירה הפרטית',
    titleHighlight: 'AI שלך',
    subtitle: 'נהל את יומן Google שלך עם פקודות קוליות טבעיות. תזמן, תזמן מחדש ומטב את הזמן שלך ללא מאמץ.',
    getStartedFree: 'התחל בחינם',
    viewPricing: 'צפה במחירים',
    featuresTitle: 'כל מה שאתה צריך לניהול הזמן שלך',
    featuresSubtitle: 'אלי משלבת אינטליגנציית AI עם אינטגרציה חלקה ליומן',
    voiceCommands: 'פקודות קוליות',
    voiceCommandsDesc: 'תזמן פגישות, הגדר תזכורות ונהל את היומן שלך באמצעות פקודות קוליות טבעיות.',
    smartScheduling: 'תזמון חכם',
    smartSchedulingDesc: 'תזמון מונע AI שמוצא את הזמנים הטובים ביותר לפגישות והתור שלך.',
    timeOptimization: 'אופטימיזציית זמן',
    timeOptimizationDesc: 'נתח את דפוסי לוח הזמנים שלך וקבל תובנות למיקסום הפרודוקטיביות.',
    ctaTitle: 'מוכן לשנות את חוויית היומן שלך?',
    ctaSubtitle: 'הצטרף לאלפי אנשי מקצוע שפישטו את התזמון שלהם עם אלי.',
    startForFree: 'התחל בחינם',
    telegramTitle: 'שוחח עם אלי בטלגרם',
    telegramDescription: 'נהל את היומן שלך בדרכים. שלח הודעות קוליות, תזמן אירועים וקבל תזכורות, הכל מטלגרם.',
    openTelegram: 'פתח בטלגרם',
    availableIn: 'זמין ב',
  },

  // Feature Showcase
  showcase: {
    badge: 'הדגמה חיה',
    title: 'צפה באלי בפעולה',
    subtitle: 'חווה ניהול יומן חלק בטלגרם ובאינטרנט',
    today: {
      title: 'לוח הזמנים של היום',
      description: 'קבל סקירה מלאה של היום שלך עם /today. צפה בכל הפגישות, בלוקי מיקוד וזמן פנוי במבט אחד.',
    },
    voice: {
      title: 'פקודות קוליות',
      description: 'שלח הודעות קוליות לניהול היומן ללא ידיים. אלי מתמללת ומבצעת את הבקשות שלך מיד.',
    },
    analytics: {
      title: 'אנליטיקת זמן',
      description:
        'עקוב אחר הפרודוקטיביות שלך עם /analytics. צפה בזמן מיקוד, עומס פגישות ומגמות שבועיות לאופטימיזציה של לוח הזמנים.',
    },
    brain: {
      title: 'מוח אלי',
      description: 'למד את אלי את ההעדפות שלך עם /brain. הגדר כללים כמו "אין פגישות לפני 10 בבוקר" ואלי תזכור.',
    },
    search: {
      title: 'חיפוש חכם',
      description: 'מצא פגישות קודמות מיד. שאל "מתי נפגשתי עם שרה לאחרונה?" וקבל תשובות מדויקות עם הקשר.',
    },
    create: {
      title: 'יצירה מהירה',
      description: 'תזמן אירועים בשפה טבעית. פשוט אמור "ארוחת צהריים עם אלכס מחר בצהריים" ואשר.',
    },
    language: {
      title: 'רב-לשוני',
      description: 'השתמש באלי בשפה המועדפת עליך עם /language. תומך באנגלית, עברית, רוסית, צרפתית, גרמנית וערבית.',
    },
  },

  // About Page
  about: {
    heroBadge: 'העלות הנסתרת של הכאוס',
    heroTitle: 'הזמן שלך',
    heroTitleHighlight: 'תחת התקפה',
    heroSubtitle:
      'כל החלפת הקשר, כל קונפליקט בתזמון, כל שעה שאבדה לעבודה אדמיניסטרטיבית. הכל מצטבר. זמן הוא המשאב היחיד שלא תוכל לקבל בחזרה.',

    problemTitle: 'הקרב היומי',
    problemSubtitle: 'אנשי מקצוע מודרניים מאבדים שעות כל שבוע לכאוס ביומן שהם לא ביקשו.',
    problemContextSwitch: 'החלפת הקשר',
    problemContextSwitchDesc: 'קפיצה בין אפליקציות, טאבים ומשימות. כל החלפה עולה לך 23 דקות של זמן ריכוז.',
    problemCalendarChaos: 'כאוס ביומן',
    problemCalendarChaosDesc: 'הזמנות כפולות, בלבול אזורי זמן, ותקשורת אינסופית רק כדי לקבוע פגישה פשוטה.',
    problemLostHours: 'שעות אבודות',
    problemLostHoursDesc: 'עומס אדמיניסטרטיבי גונב את השעות הפרודוקטיביות ביותר שלך. זמן שיועד לעבודה עמוקה נעלם.',
    problemBlindSpots: 'נקודות עיוורות',
    problemBlindSpotsDesc: 'לאן נעלם יום שלישי? פערים ביומן שלך שאתה אף פעם לא יכול לתת עליהם דין וחשבון.',

    visionBadge: 'במה אנחנו מאמינים',
    visionTitle: 'כל אחד מגיע לו מזכירה AI פרטית',
    visionP1:
      'בנינו את אלי כי אנחנו מאמינים שהיומן שלך צריך לעבוד בשבילך, לא נגדך. הוא צריך להגן על העדיפויות שלך, לא רק לתעד אותן.',
    visionP2:
      'אותה טכנולוגיית AI שמפעילה פתרונות ארגוניים צריכה להיות זמינה לכל בעל עסק, מנהל ואיש מקצוע שמעריך את הזמן שלו.',
    visionBelief1: 'היומן שלך צריך להגן על העבודה העמוקה שלך, לא רק לקבוע עליה פגישות.',
    visionBelief2: 'ניהול הזמן שלך צריך לקחת שניות, לא שעות של אדמיניסטרציה.',
    visionBelief3: 'הנתונים שלך שייכים לך. לעולם לא נמכרים, לעולם לא משמשים לאימון.',

    impactTitle: 'מה משתנה כשאתה משתמש באלי',
    impactSubtitle: 'השפעה אמיתית על איך אתה עובד וחי.',
    impactHours: 'שעות שהוחזרו',
    impactHoursDesc: 'הפסק לאבד זמן על עומס תזמון. קבל שעות בחזרה כל שבוע לעבודה שבאמת משנה.',
    impactFocus: 'מיקוד מוגן',
    impactFocusDesc: 'אלי מגינה על בלוקי העבודה העמוקה שלך מהפרעות, תוך תזמון מחדש חכם של קונפליקטים.',
    impactGaps: 'פערים שהושלמו',
    impactGapsDesc: 'לעולם לא תתהה לאן הלך הזמן שלך. אלי מוצאת ועוזרת לך למלא את הפערים ביומן.',
    impactVoice: 'מקול לפעולה',
    impactVoiceDesc: 'ממחשבה לאירוע מתוזמן בשניות. פשוט דבר בטבעיות ואלי תטפל בשאר.',

    differenceTitle: 'אנחנו שונים בתכנון',
    differenceSubtitle: 'נבנה מאפס עם עדיפויות שונות.',
    differencePrivacy: 'פרטיות קודמת',
    differencePrivacyDesc:
      'הנתונים שלך מוצפנים, לעולם לא נמכרים, ולעולם לא משמשים לאימון מודלי AI. המשרד הפרטי שלך נשאר פרטי.',
    differenceMultiPlatform: 'עובד איפה שאתה עובד',
    differenceMultiPlatformDesc:
      'אינטרנט, קול, טלגרם, וואטסאפ. אלי זמינה בכל מקום שאתה נמצא, בכל דרך שאתה מעדיף לתקשר.',
    differenceProactive: 'פרואקטיבי, לא פסיבי',
    differenceProactiveDesc:
      'אלי לא רק מתעדת את לוח הזמנים שלך. היא מגינה על הזמן שלך, מציעה אופטימיזציות, ומטפלת בקונפליקטים אוטומטית.',

    ctaBadge: 'הצטרף לתנועה',
    ctaTitle: 'תבע בחזרה את הזמן שלך',
    ctaSubtitle: 'הפסק להילחם ביומן שלך. התחל לפקד עליו. הצטרף לאלפי אנשי מקצוע שלקחו בחזרה שליטה.',
    ctaPrimary: 'התחל בחינם',
    ctaSecondary: 'צפה במחירים',
  },

  // Contact Page
  contact: {
    badge: 'צור קשר',
    title: 'צור קשר',
    subtitle: 'יש לך שאלה, משוב או צריך תמיכה? נשמח לשמוע ממך.',
    emailUs: 'שלח לנו מייל',
    emailUsDesc: 'לפניות כלליות ותמיכה',
    responseTime: 'זמן תגובה',
    responseTimeDesc: 'אנחנו בדרך כלל מגיבים תוך 24-48 שעות בימי עסקים.',
    form: {
      name: 'שם',
      namePlaceholder: 'השם שלך',
      email: 'אימייל',
      emailPlaceholder: 'your@email.com',
      subject: 'נושא',
      subjectPlaceholder: 'איך נוכל לעזור?',
      message: 'הודעה',
      messagePlaceholder: 'ספר לנו עוד...',
      submit: 'שלח הודעה',
      submitting: 'שולח...',
      success: 'ההודעה נשלחה בהצלחה!',
      error: 'שליחת ההודעה נכשלה. נסה שוב.',
    },
  },

  // Support Modal
  support: {
    modal: {
      title: 'צור קשר עם התמיכה',
      submitSuccessTitle: 'הכרטיס נשלח',
      submitSuccessDescription: 'נחזור אליך בהקדם האפשרי.',
      ticketNumber: 'מספר הכרטיס שלך הוא',
      close: 'סגור',
      submitAnother: 'שלח עוד',
      describeIssue: 'תאר את הבעיה שלך...',
      whatAllyUnderstood: 'מה Ally הבין',
      messageWillAppear: 'ההודעה שלך תופיע כאן...',
      sending: 'שולח...',
      sendToSupport: 'שלח לתמיכה',
      type: 'הקלד',
      speak: 'דבר',
      pleaseDescribeIssue: 'אנא תאר את הבעיה שלך',
      ticketSubmitted: 'כרטיס התמיכה נשלח בהצלחה',
      submitError: 'אירעה שגיאה בעת שליחת הכרטיס שלך',
    },
  },

  // AI Ally Sidebar
  allySidebar: {
    initialMessage:
      'היי! אני Ally, העוזר האינטליגנטי שלך. איך אני יכול לעזור לך לבצע אופטימיזציה ללוח הזמנים שלך היום?',
    responseMessage: 'אני מבין! תן לי לנתח את לוח הזמנים שלך ולהציע אופטימיזציות.',
    quickActions: {
      optimizeSchedule: 'אופטימיזציה של לוח זמנים',
      findFreeTime: 'מצא זמן פנוי',
      rescheduleMeeting: 'תזמן מחדש פגישה',
    },
    placeholder: 'שאל את Ally משהו...',
    poweredBy: 'מופעל על ידי Ally AI',
    support: 'תמיכה',
    cancelVoiceRecording: 'בטל הקלטת קול',
    sendMessage: 'שלח הודעה',
    toggleVoiceInput: 'החלף קלט קולי',
  },

  chatError: {
    upgradeNow: 'שדרג עכשיו',
  },

  eventConfirmation: {
    foundEvents: 'נמצאו {{count}} {{eventText}} להוספה',
    allDay: 'כל היום',
    cancel: 'ביטול',
    addEvents: 'הוסף {{eventText}}',
  },

  rescheduleDialog: {
    title: 'תזמון חכם מחדש',
    description: 'מצא את הזמן הטוב ביותר לתזמון מחדש',
    preferredTimeOfDay: 'זמן מועדף ביום',
    timeOptions: {
      any: 'כל זמן',
      morning: 'בוקר',
      afternoon: 'צהריים',
      evening: 'ערב',
    },
    current: 'נוכחי:',
    findingOptimalTimes: 'מחפש זמנים אופטימליים...',
    failedToLoadSuggestions: 'נכשל בטעינת הצעות',
    tryAgain: 'נסה שוב',
    noAvailableSlots: 'לא נמצאו חריצי זמן זמינים ב-7 הימים הבאים.',
    tryDifferentTimePreference: 'נסה העדפת זמן שונה.',
    cancel: 'ביטול',
    rescheduling: 'מתזמן מחדש...',
    reschedule: 'תזמן מחדש',
  },

  // Pricing Page
  pricing: {
    testimonialsTitle: 'הסטנדרט לביצוע אסטרטגי',
    testimonialsSubtitle: 'הצטרף לאלפי מנהיגים שהאוטמו את התזמון שלהם כדי להגן על שעות העבודה היקרות ביותר שלהם.',
    testimonialsBadge: 'יעילות מאומתת',
    error: {
      title: 'לא ניתן לטעון את המחירים',
      description: 'לא הצלחנו לקבל את פרטי התמחור העדכניים. אנא נסה שוב מאוחר יותר.',
    },
  },

  // Login Page
  login: {
    title: 'ברוך שובך',
    subtitle: 'גש למזכירה הפרטית שלך בצורה מאובטחת.',
    loginWithGoogle: 'התחבר עם Google',
    connecting: 'מתחבר...',
    noAccount: 'אין לך חשבון?',
    signUp: 'הירשם',
    errors: {
      noToken: 'האימות נכשל. נסה שוב.',
      callbackFailed: 'OAuth callback נכשל. נסה שוב.',
      sessionExpired: 'פג תוקף ההתחברות שלך. אנא התחבר שוב.',
      accountDeleted: 'החשבון שלך נמחק. אנא הירשם מחדש.',
      accountDeactivated: 'החשבון שלך הושבת. אנא פנה לתמיכה.',
    },
  },

  // Register Page
  register: {
    title: 'הצטרף לאלי',
    subtitle: 'התחל לייעל את הפעולות המנהליות שלך היום.',
    signUpWithGoogle: 'הירשם עם Google',
    connecting: 'מתחבר...',
    agreeToTerms: 'בהרשמה, אתה מסכים ל',
    termsOfService: 'תנאי השימוש',
    and: 'ול',
    privacyPolicy: 'מדיניות הפרטיות',
    haveAccount: 'יש לך כבר חשבון?',
    login: 'התחבר',
  },

  // Callback Page
  callback: {
    securingConnection: 'מאבטח את החיבור שלך...',
    syncingCalendar: 'מסנכרן את היומן שלך...',
    preparingWorkspace: 'מכין את סביבת העבודה שלך...',
    almostThere: 'כמעט שם...',
    authFailed: 'האימות נכשל',
    somethingWentWrong: 'משהו השתבש',
    redirectingToLogin: 'מעביר להתחברות...',
    completingSignIn: 'משלים את ההתחברות...',
    tagline: 'עוזרת היומן המונעת AI שלך',
    loading: 'טוען...',
    noAccessToken: 'לא התקבל אסימון גישה',
  },

  // Sidebar Navigation
  sidebar: {
    chat: "צ'אט",
    chatDescription: 'שוחח עם אלי לניהול היומן שלך',
    assistant: 'עוזרת',
    assistantDescription: 'שוחח עם העוזרת החכמה שלך לניהול אירועים ולוחות זמנים',
    admin: 'ניהול',
    adminDescription: 'גישה ללוח הניהול לניהול משתמשים, מנויים והגדרות מערכת',
    calendar: 'יומן',
    calendarDescription: 'צפה ונהל את אירועי היומן שלך בתצוגות חודש, שבוע, יום ורשימה',
    analytics: 'אנליטיקס',
    analyticsDescription: 'צפה בתובנות על הקצאת זמן, דפוסי אירועים ומגמות פרודוקטיביות',
    quickAddEvent: 'הוספה מהירה',
    quickAddEventDescription: 'צור אירועי יומן באופן מיידי עם שפה טבעית או קלט קולי',
    gapRecovery: 'שחזור פערים',
    gapRecoveryDescription: 'גלה ושחזר פערי זמן לא מתועדים ביומן שלך',
    calendars: 'יומנים',
    calendarsDescription: 'נהל את מקורות יומן Google שלך וצור יומנים חדשים',
    activity: 'פעילות',
    activityDescription: 'צפה בהיסטוריית השיחות והאינטראקציות הקודמות שלך עם אלי',
    telegram: 'טלגרם',
    telegramDescription: 'התחבר ונהל את שילוב בוט הטלגרם שלך',
    account: 'חשבון',
    accountDescription: 'נהל את הפרופיל שלך, שירותים מחוברים והגדרות חשבון',
    settings: 'הגדרות',
    logout: 'התנתקות',
    chatWithAlly: 'שוחח עם אלי',
    minimize: 'מזער',
    toggleSidebar: 'החלף סרגל צדדי',
    // User Footer items
    upgradeToPro: 'שדרג לפרו',
    billing: 'חיוב',
    notifications: 'התראות',
    logOut: 'התנתק',
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

    tabs: {
      overview: 'סקירה',
      patterns: 'דפוסים',
      time: 'זמן',
      calendars: 'יומנים',
      health: 'בריאות',
    },

    calendarFilter: {
      filterByCalendar: 'סנן לפי יומן',
      allCalendars: 'כל היומנים',
      oneCalendar: 'יומן אחד',
      multipleCalendars: '{{count}} יומנים',
      clear: 'נקה',
      noCalendars: 'אין יומנים זמינים',
    },

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
      chatView: "תצוגת צ'אט",
      avatarView: 'תצוגת אווטאר 2D',
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

    avatarView: {
      startConversation: 'התחל שיחה',
      speakOrType: 'דבר או הקלד כדי להתחיל',
      liveContext: 'הקשר חי',
      cancelEdit: 'בטל עריכה',
      confirmEdit: 'אשר עריכה',
    },
  },

  // Gap Recovery
  gaps: {
    title: 'שחזור פערים',
    description: 'גלה זמן לא מתועד ביומן שלך',
    analyzing: 'מנתח את היומן שלך...',
    refresh: 'רענן',

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

    subtitle: 'גלה הזדמנויות תזמון ביומן שלך',
    potentialGaps: 'פערים פוטנציאליים זוהו',
    analyzingPeriod: 'תקופת ניתוח:',
    actions: {
      selectCalendar: 'בחר יומן',
      creating: 'יוצר...',
      createEvent: 'צור אירוע',
      skipping: 'מדלג...',
      skipGap: 'דלג על פער',
      dismissAllGaps: 'סגור את כל הפערים',
    },
    tabs: {
      gaps: 'פערים',
      analytics: 'אנליטיקה',
      settings: 'הגדרות',
    },
    stats: {
      totalGaps: 'סך הפערים',
      potentialOpportunities: 'הזדמנויות פוטנציאליות',
      highConfidence: 'ביטחון גבוה',
      ofTotal: '{{percent}}% מהסך',
      potentialHours: 'שעות פוטנציאליות',
      availableForScheduling: 'זמין לתזמון',
      avgGapSize: 'גודל פער ממוצע',
      averageGapDuration: 'משך פער ממוצע',
    },
    analytics: {
      totalPotentialHours: 'סך שעות פוטנציאליות',
      availableForScheduling: 'זמין לתזמון',
      averageGap: 'פער ממוצע',
      typicalGapSize: 'גודל פער טיפוסי',
      largestGap: 'הפער הגדול ביותר',
      bestOpportunity: 'ההזדמנות הטובה ביותר',
      analysisPeriod: 'תקופת ניתוח',
      to: 'עד',
      confidenceDistribution: 'התפלגות ביטחון',
      confidenceDescription: 'עד כמה ה-AI שלנו בטוח בכל הצעת פער',
      highConfidence: 'ביטחון גבוה',
      mediumConfidence: 'ביטחון בינוני',
      lowConfidence: 'ביטחון נמוך',
      durationDistribution: 'התפלגות משך',
      durationDescription: 'פירוט גדלי פערים לפי משך',
      lessThanOneHour: '< שעה',
      oneToTwoHours: '1-2 שעות',
      twoOrMoreHours: '2+ שעות',
      analysisSettings: 'הגדרות ניתוח',
      settingsDescription: 'תצורה נוכחית לזיהוי פערים',
      minGap: 'מינימום פער:',
      maxGap: 'מקסימום פער:',
      lookback: 'מבט לאחור:',
      autoAnalysis: 'ניתוח אוטומטי:',
      enabled: 'מופעל',
      disabled: 'מושבת',
      calendars: 'יומנים:',
      calendarsIncluded: '{{count}} כלולים',
      languages: 'שפות:',
      languagesSupported: '{{count}} נתמכות',
      days: 'ימים',
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
    appearance: 'מראה',
    appearanceTooltip: 'בחר את ערכת הצבעים המועדפת עליך לממשק',
    defaultTimezone: 'אזור זמן ברירת מחדל',
    timezoneTooltip: 'אירועים יתוזמנו באזור זמן זה אלא אם צוין אחרת',
    timeFormat: 'פורמט זמן',
    timeFormatTooltip: 'פורמט תצוגה לשעות אירועים בכל האפליקציה',
    timeFormat12h: '12 שעות (AM/PM)',
    timeFormat24h: '24 שעות',
    realTimeLocation: 'מיקום בזמן אמת',
    realTimeLocationTooltip:
      'כאשר מופעל, Ally משתמש במיקום הנוכחי שלך כדי לספק הקשר ליצירת אירועים (למשל, הצעת מקומות בקרבת מקום)',
    memberSince: 'חבר מ',
    languageTooltip: 'בחר את השפה המועדפת עליך לממשק',
    general: 'כללי',
    generalDescription: 'נהל את הפרופיל וההעדפות שלך',
    tabs: {
      general: 'כללי',
      account: 'מנוי',
      integrations: 'אינטגרציות',
      assistant: 'מוח אלי',
      notifications: 'התראות',
      security: 'אבטחה',
      dataControls: 'נתונים',
    },
  },

  // Dialogs
  dialogs: {
    confirm: {
      confirm: 'אישור',
      cancel: 'ביטול',
    },
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
      available: 'זמין',
      busy: 'עסוק',
      events: 'אירועים',
      eventsTitle: 'אירועים',
      freeTime: 'יש לך {{hours}} שעות פנויות ביום זה.',
    },
    eventSearch: {
      placeholder: 'חיפוש לפי כותרת או תיאור...',
      noMatches: 'אין אירועים התואמים לחיפוש שלך.',
      clearSearch: 'נקה חיפוש',
      noEvents: 'לא נמצאו אירועים ליומן זה בטווח התאריכים שנבחר.',
      totalHours: 'סה"כ שעות',
      totalEvents: 'סה"כ אירועים',
      filteredHours: 'שעות מסוננות: {{filtered}} שעות (מתוך {{total}} שעות)',
      filteredEvents: 'אירועים מסוננים: {{filtered}} (מתוך {{total}})',
      filteredBusy: 'מסונן: {{filtered}} שעות (מתוך {{total}} שעות)',
      filteredCount: 'אירועים: {{filtered}} מתוך {{total}}',
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
      subtitle: 'הזן שם ליומן החדש שלך. הוא יתווסף לחשבון Google Calendar שלך.',
      name: 'שם היומן',
      namePlaceholder: 'לדוגמה: פרויקטי עבודה, יעדים אישיים, כושר',
      description: 'תיאור',
      descriptionPlaceholder: 'הוסף תיאור...',
      color: 'צבע',
      creating: 'יוצר...',
      create: 'צור יומן',
    },
    quickEvent: {
      title: 'הוספה מהירה',
      description: 'הוסף אירוע ליומן שלך בשפה טבעית או בקול',
      placeholder: 'תאר את האירוע שלך בשפה טבעית...',
      examples: 'דוגמאות:',
      example1: 'פגישה עם יוסי מחר ב-15:00',
      example2: 'ארוחת צהריים בקפה רומא ביום שישי ב-12:30 לשעה',
      example3: 'סטנדאפ צוות כל יום שני ב-9:00',
      recording: 'מקליט... לחץ על המיקרופון לעצירה',
      pressEnter: 'לחץ Enter לעיבוד',
      processing: 'מעבד...',
      createEvent: 'צור אירוע',
      ally: 'אלי',
      yourAIAssistant: 'העוזר החכם שלך',
      listening: 'מאזין... לחץ שוב לעצירה.',
      listeningToYou: 'מאזין למה שאמרת...',
      understanding: 'מבין את הבקשה שלך...',
      eventAdded: 'האירוע נוסף ליומן שלך!',
      conflictDetected: 'זה מתנגש עם אירועים קיימים.',
      creatingAnyway: 'יוצר את האירוע בכל זאת...',
      failedTranscribe: 'נכשל בתמלול שמע. אנא נסה שוב.',
      couldNotTranscribe: 'לא ניתן לתמלל שמע.',
      failedCreate: 'נכשל ביצירת אירוע.',
      unexpectedConflict: 'התנגשות בלתי צפויה',
      allowMicrophone: 'אנא אפשר גישה למיקרופון לשימוש בקלט קולי.',
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
    startAudit: 'התחל ביקורת',
    allyProtocol: 'פרוטוקול אלי',
    steps: {
      welcome: {
        title: 'ברוך הבא לאלי',
        description: 'העוזר החכם שלך ליומן',
        content:
          'אלי עוזר לך לנהל את היומן שלך בקלות באמצעות שפה טבעית. פשוט אמור לאלי מה אתה צריך, והוא יטפל בכל השאר.',
        audioText:
          'ברוך הבא לאלי, העוזר החכם שלך ליומן! אני כאן כדי לעזור לך לנהל את לוח הזמנים שלך בקלות. תן לי להראות לך סביב.',
      },
      assistant: {
        title: 'מרכז הפיקוד שלך',
        content: "זהו ממשק הצ'אט הראשי. האצל משימות, תזמן פגישות, או בקש סיכומים כאן.",
      },
      analytics: {
        title: 'אינטליגנציית ביצועים',
        content: 'עקוב אחר יחס העבודה העמוקה שלך וראה בדיוק כמה זמן אלי מחזירה לך.',
      },
      integrations: {
        title: 'קישוריות חלקה',
        content: 'חבר את אלי ל-WhatsApp, Telegram ומקורות היומן שלך כדי לרכז את הפעילויות שלך.',
      },
      settings: {
        title: 'פרטיות ושליטה',
        content: 'נהל כאן את הגדרות הזיכרון ההקשרי והעדפות אבטחת החשבון שלך.',
      },
      chat: {
        title: 'שוחח עם אלי',
        description: 'תזמון בשפה טבעית',
        content:
          'פשוט הקלד או דבר באופן טבעי. אמור דברים כמו "קבע פגישה עם ג׳ון מחר בשעה 2" או "מה יש לי בשבוע הבא?" אלי מבין הקשר ומטפל בבקשות מורכבות.',
        audioText:
          'ממשק הצ\'אט הוא הדרך העיקרית שלך להתקשר איתי. פשוט הקלד באופן טבעי, כמו שאתה שולח הודעה לחבר. אמור דברים כמו "קבע ארוחת צהריים עם שרה מחר" או "אילו פגישות יש לי השבוע?"',
      },
      gaps: {
        title: 'החזר זמן אבוד',
        description: 'מצא ומלא פערים בלוח הזמנים',
        content:
          'אלי מזהה באופן אוטומטי זמן לא מתועד ביומן שלך. בדוק את הפערים האלה והוסף אירועים במהירות כדי לשמור על רישום מדויק של הפעילויות שלך.',
        audioText:
          'שחזור פערים הוא תכונה ייחודית שעוזרת לך לעקוב לאן הזמן שלך הולך. אני אזהה תקופות שלא מחושבות ביומן שלך, כדי שתוכל למלא אותן ולשמור על לוח זמנים מדויק.',
      },
      complete: {
        title: 'אתה מוכן!',
        description: 'התחל לנהל את היומן שלך',
        content:
          'אתה מוכן להשתמש באלי! זכור, אתה תמיד יכול לגשת להגדרות כדי להתאים אישית את החוויה שלך, לחבר יומנים נוספים, או להתאים העדפות התראות.',
        audioText:
          'מזל טוב! אתה מוכן להתחיל להשתמש באלי. אם אי פעם תצטרך עזרה, פשוט שאל אותי. אני כאן כדי להפוך את ניהול היומן שלך לקל. בואו נתחיל!',
      },
    },
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

  errors: {
    generic: 'משהו השתבש. אנא נסה שוב.',
    network: 'שגיאת רשת. אנא בדוק את החיבור שלך.',
    unauthorized: 'אנא התחבר כדי להמשיך.',
    notFound: 'המשאב המבוקש לא נמצא.',
    serverError: 'שגיאת שרת. אנא נסה שוב מאוחר יותר.',
    hitSnag: 'אלי נתקלה בבעיה',
    hitSnagDesc: 'גם העוזרים הטובים ביותר נכשלים לפעמים. רשמתי את הבעיה, אבל בוא ננסה להחזיר אותך לפעולה.',
    viewSystemLogs: 'צפה ביומני מערכת',
    referenceId: 'מזהה ייחוס',
    persistsContact: 'אם הבעיה נמשכת, אנא פנה לתמיכה עם מזהה הייחוס למעלה.',
    criticalError: 'אירעה שגיאה קריטית. אנא נסה שוב או פנה לתמיכה אם הבעיה נמשכת.',
    viewErrorDetails: 'צפה בפרטי השגיאה',
    errorId: 'מזהה שגיאה',
    tryAgain: 'נסה שוב',
    reloadPage: 'טען את הדף מחדש',
    returnHome: 'חזור לדף הבית',
    retrying: 'מנסה שוב...',
    somethingWentWrong: 'משהו השתבש',
    copy: 'העתק',
    copied: 'הועתק!',
    copyError: 'העתק פרטי שגיאה',
  },

  bento: {
    title: 'פרטי. מאובטח. בנוי למהירות.',
    subtitle: 'עוזר AI שתוכנן סביב הצרכים המרכזיים שלך כמנהיג.',
    features: {
      deepWork: {
        name: 'הגן על העבודה העמוקה שלך',
        description: 'אלי מגנה אוטומטית על בלוקי העבודה החשובים ביותר שלך מהפרעות על ידי תזמון מחדש חכם של התנגשויות.',
        cta: 'למד עוד',
      },
      flexibleScheduling: {
        name: 'תזמון גמיש',
        description: 'סדרי העדיפויות משתנים. אלי מקלה על התאמת לוח הזמנים שלך תוך כדי תנועה ללא הדיונים הרגילים.',
        cta: 'ראה איך זה עובד',
      },
      worksEverywhere: {
        name: 'עובד איפה שאתה',
        description: 'נהל את היומן שלך מטלגרם ווואטסאפ. אלי תמיד זמינה, היכן שאתה נמצא.',
        cta: 'חקור אינטגרציות',
      },
      chatToDone: {
        name: 'מצ׳אט לביצוע',
        description: 'הדרך המהירה ביותר ממחשבה לאירוע מתוזמן. פשוט שלח הודעה פשוטה.',
        cta: 'נסה עכשיו',
      },
      secure: {
        name: 'מאובטח מהיסוד',
        description: 'הפרטיות שלך היא בסיסית. המידע תמיד מוצפן ולעולם לא משמש לאימון מודלים.',
        cta: 'מדיניות פרטיות',
      },
    },
  },

  testimonials: {
    badge: 'משוב ראשון',
    title: 'מה המשתמשים הראשונים אומרים',
    subtitle: 'ראו מה המשתמשים הראשונים שלנו חושבים. המשוב שלכם יכול להופיע כאן גם!',
    cta: 'היו מהראשונים',
    feedbackButton: 'שתפו את המשוב שלכם',
    featured: {
      name: 'יוסף סבג',
      role: 'מנכ"ל',
      content: 'השימוש באלי שינה את הדרך שבה אני עוקב אחר לוח הזמנים שלי ומקבל תובנות טובות יותר.',
    },
  },

  faq: {
    title: 'שאלות נפוצות',
    contactCta: 'צריך פריסה ארגונית? צור קשר עם',
    operationsTeam: 'צוות התפעול',
    questions: {
      interactions: {
        question: 'למה אתם גובים על "אינטראקציות"?',
        answer:
          'אנחנו מאמינים בהחלפת ערך שקופה. כל אינטראקציה משתמשת בהיגיון עצבי מתקדם לבדיקה או התאמה של הפעולות שלך. על ידי מדידת אינטראקציות, אנחנו מבטיחים שאתה משלם רק על השליטה שאתה באמת מפעיל על לוח הזמנים שלך.',
      },
      sovereignty: {
        question: 'מהי "ריבונות מלאה"?',
        answer:
          'תוכנית הבכירים ב-$7/חודש מעניקה לך גישה בלתי מוגבלת לבורר העצבי שלנו. זה למנהלים בעלי נפח גבוה שצריכים פיקוח 24/7 על מספר יומנים מורכבים עם עיבוד עצבי עדיפות.',
      },
      audit: {
        question: 'האם אני יכול לבדוק את נתוני הזמן שלי?',
        answer:
          'כן. לוח הבקרה של המודיעין שלנו מספק תובנות מפורטות על יחס המיקוד ועלויות החלפת ההקשר שלך. אנחנו מאמינים שאתה צריך להחזיק בנתוני הזמן שלך כמו שאתה מחזיק בעסק שלך.',
      },
      dataTraining: {
        question: 'האם המידע שלי משמש לאימון AI?',
        answer:
          'בהחלט לא. אנחנו מאמינים שהמשרד הפרטי שלך צריך להישאר פרטי. לוח הזמנים שלך מאוחסן בסילו מוצפן ולעולם לא משמש לאימון מודלים בסיסיים. הריבונות שלך היא העדיפות שלנו.',
      },
      credits: {
        question: 'איך חבילות קרדיטים מותאמות אישית מתרחבות?',
        answer:
          'לעסקים עם עומסי עבודה עונתיים, קרדיטים מותאמים אישית ($1 = 100 פעולות) מאפשרים לך להרחיב או לצמצם את השליטה שלך ללא שינוי המנוי. הם לעולם לא פגים ומשמשים כעתודה תפעולית.',
      },
    },
  },

  useCases: {
    intelligentScheduling: {
      title: 'תזמון חכם',
      description: 'מוצא את הזמן המושלם לפגישות, מנווט ביומנים ואזורי זמן מורכבים ללא מאמץ.',
      userMessage: 'מצא 30 דקות עבורי, שרה ואלכס.',
      allyResponse: 'בוצע. יום שלישי ב-14:30.',
      confirmation: 'כל היומנים עודכנו.',
    },
    focusProtection: {
      title: 'הגנה על זמן מיקוד',
      description: 'מגנה אוטומטית על זמני העבודה העמוקה שלך מהפרעות על ידי תזמון מחדש חכם של התנגשויות.',
      userMessage: 'הגן על הבוקר שלי לאסטרטגיית Q4.',
      allyResponse: 'היומן שלך חסום מ-9:00 עד 12:00.',
      focusModeActive: 'מצב מיקוד פעיל.',
    },
    travelAgent: {
      title: 'סוכן נסיעות פרואקטיבי',
      description: 'עוקב אחר תוכניות הנסיעה שלך, מתאים אוטומטית לעיכובים ומעדכן את כל בעלי העניין.',
      delayAlert: 'הטיסה ל-SFO עוכבה בשעתיים.',
      allyResponse: 'טופל. שירות הרכב והמלון עודכנו.',
    },
    voiceToAction: {
      title: 'מקול לפעולה',
      description: 'לכוד מחשבות ופקודות בדרך. אלי מתמללת, מבינה ומבצעת משימות באופן מיידי.',
      userMessage: '"הזכר לי להתקשר למשקיעים ב-4 אחה״צ"',
      allyResponse: "תזכורת נקבעה: 'התקשר למשקיעים' ב-16:00.",
    },

    // Navigation tabs
    tabs: {
      overview: 'סקירה',
      patterns: 'דפוסים',
      time: 'זמן',
      calendars: 'לוחות שנה',
      health: 'בריאות',
    },
  },

  // Feature Carousel
  featureCarousel: {
    intelligentScheduling: {
      title: 'תזמון חכם',
      description: 'אלי מתזמר פגישות מורכבות בין צוותים ואזורי זמן ללא כל חיכוך.',
    },
    whatsappRelay: {
      title: 'ריליי WhatsApp',
      description: "המסנג'ר הפופולרי בעולם, עכשיו שורת הפקודה האקזקוטיבית שלך. פרטי, מהיר, ותמיד זמין.",
    },
    executiveDigests: {
      title: 'תקצירים אקזקוטיביים',
      description: 'הופך תמלולי שעה ל-5 דקות של סיכומים וצעדים פעולה.',
    },
    proactiveLogistics: {
      title: 'לוגיסטיקה יזומה',
      description: 'מנטר טיסות ושירותי רכב, מתאים את לוח הזמנים בזמן אמת לעיכובים.',
    },
    focusProtection: {
      title: 'הגנת מיקוד',
      description: 'מגן אוטומטית על סשני העבודה העמוקה שלך ומחסום הפרעות.',
    },
    conflictArbitrator: {
      title: 'בורר קונפליקטים',
      description: 'אלי מזהה חפיפות לוח זמנים ומציע באופן יזום פתרונות הגיוניים.',
    },
    voiceToAction: {
      title: 'מקול לפעולה',
      description: 'הקלט פקודות בדרך. אלי מבצע משימות מורכבות משמע קול פשוט.',
    },
    leverageAnalytics: {
      title: 'ניצול אנליטיקה',
      description: 'כמת את ההשפעה שלך עם תובנות עמוקות לדפוסי הפרודוקטיביות שלך.',
    },
  },

  billing: {
    title: 'חיוב ומנוי',
    subtitle: 'נהל את המנוי ופרטי החיוב שלך',
    manageBilling: 'ניהול חיוב',
    paymentSuccess: 'התשלום בוצע בהצלחה!',
    subscriptionActivated: 'המנוי שלך הופעל.',
    freePlan: 'תוכנית חינמית',
    billedAnnually: 'חיוב שנתי',
    billedMonthly: 'חיוב חודשי',
    status: {
      trial: 'ניסיון',
      active: 'פעיל',
      pastDue: 'באיחור',
      canceled: 'בוטל',
      free: 'חינם',
    },
    trial: {
      daysLeft: '{{count}} יום נותר',
      fullAccess: 'תקופת הניסיון כוללת גישה מלאה לכל התכונות. ללא חיוב עד סוף תקופת הניסיון.',
      expired: 'תקופת הניסיון הסתיימה',
      expiredDescription: 'תקופת הניסיון שלך הסתיימה – שדרג עכשיו כדי לשמור על הגישה.',
      activeDescription: 'תקופת הניסיון החינמית שלך מסתיימת בעוד {{count}} יום. אל תאבד גישה לעוזר הAI שלך.',
      remaining: 'נותרו',
      getDeal: 'קבל את ההצעה',
    },
    moneyBack: {
      title: 'ערבות החזר כספי של 30 יום פעילה',
      description: 'לא מרוצה? קבל החזר מלא, ללא שאלות.',
    },
    cancelNotice: {
      title: 'המנוי שלך יבוטל בסוף תקופת החיוב הנוכחית',
      accessUntil: 'גישה עד: {{date}}',
    },
    usage: {
      title: 'שימוש בתקופה הנוכחית',
      aiInteractions: 'אינטראקציות AI',
      unlimited: 'ללא הגבלה',
      remaining: '{{count}} נותרו',
      usedDuringTrial: '{{count}} נוצלו בתקופת הניסיון',
      creditBalance: 'יתרת קרדיטים',
      credits: '{{count}} קרדיטים',
    },
    transactions: {
      title: 'היסטוריית עסקאות',
    },
    plans: {
      title: 'תוכניות זמינות',
      popular: 'פופולרי',
      perMonth: '/חודש',
      unlimitedInteractions: 'אינטראקציות ללא הגבלה',
      interactionsPerMonth: '{{count}} אינטראקציות/חודש',
      upgrade: 'שדרג',
      downgrade: 'שנמך',
      currentPlan: 'התוכנית הנוכחית',
    },
    actions: {
      title: 'פעולות מנוי',
      cancelSubscription: 'ביטול מנוי',
      cancelDesc: 'תישאר עם גישה עד סוף תקופת החיוב',
      cancel: 'בטל',
      requestRefund: 'בקש החזר מלא',
      refundDesc: 'ערבות החזר כספי של 30 יום - ללא שאלות',
    },
    confirm: {
      cancelTitle: 'ביטול מנוי',
      cancelDescription:
        'האם אתה בטוח שברצונך לבטל את המנוי? עדיין תהיה לך גישה לכל התכונות עד סוף תקופת החיוב הנוכחית.',
      cancelTrialDescription: 'האם אתה בטוח שברצונך לבטל את תקופת הניסיון? תאבד גישה לתכונות פרימיום מיד.',
      cancelButton: 'כן, בטל',
      keepButton: 'שמור על המנוי',
      refundTitle: 'בקש החזר',
      refundDescription: 'האם אתה בטוח שברצונך לבקש החזר מלא? המנוי שלך יבוטל מיד והגישה תבוטל.',
      refundButton: 'בקש החזר',
      nevermindButton: 'ביטול',
    },
  },

  // Toast messages
  toast: {
    // General settings
    timezoneUpdated: 'אזור זמן עודכן',
    timezoneUpdateFailed: 'נכשל בעדכון אזור זמן',
    timeFormatUpdated: 'פורמט זמן עודכן',
    timeFormatUpdateFailed: 'נכשל בעדכון פורמט זמן',
    realTimeLocationEnabled: 'מיקום בזמן אמת הופעל',
    realTimeLocationDisabled: 'מיקום בזמן אמת בוטל',
    locationEnableFailed: 'נכשל בהפעלת מיקום',
    locationDisableFailed: 'נכשל בביטול מיקום',
    locationAccessDenied: 'גישה למיקום נדחתה',
    locationAccessDeniedDescription: 'אנא אפשר גישה למיקום בהגדרות הדפדפן שלך.',

    // Integrations
    crossPlatformSyncEnabled: 'סנכרון בין פלטפורמות הופעל',
    crossPlatformSyncDisabled: 'סנכרון בין פלטפורמות בוטל',
    integrationUpdateFailed: 'נכשל בעדכון העדפה',

    // Assistant settings
    voiceInputError: 'שגיאת קלט קולי',
    customInstructionsSaved: 'הוראות מותאמות נשמרו',
    instructionsSaveFailed: 'נכשל בשמירת הוראות',
    contextualSchedulingEnabled: 'תזמון הקשרי הופעל',
    contextualSchedulingDisabled: 'תזמון הקשרי בוטל',
    memoryManagementUpdateFailed: 'נכשל בעדכון העדפה',

    // Chat
    allyResponded: 'אלי ענתה',
    memoryUpdated: 'זיכרון עודכן',
    regeneratingResponse: 'מייצר תגובה מחדש...',

    // Gaps
    gapsSettingsSaved: 'הגדרות נשמרו בהצלחה',
    gapsSettingsSaveFailed: 'נכשל בשמירת הגדרות',

    // Conversations
    titleUpdated: 'כותרת עודכנה בהצלחה',
    titleUpdateFailed: 'נכשל בעדכון כותרת',
    shareLinkCopied: 'קישור שיתוף הועתק ללוח',
    shareLinkCreateFailed: 'נכשל ביצירת קישור שיתוף',
    conversationPinned: 'שיחה נעוצה בהצלחה',
    conversationUnpinned: 'שיחה בוטלה נעיצתה בהצלחה',
    conversationPinFailed: 'נכשל בנעיצת שיחה',

    // Archived conversations
    conversationRestored: 'שיחה שוחזרה בהצלחה',
    conversationRestoreFailed: 'נכשל בשחזור שיחה',
    allConversationsRestored: 'כל השיחות שנמחקו שוחזרו בהצלחה',
    conversationsRestoreFailed: 'נכשל בשחזור שיחות',

    // Settings modal
    googleCalendarDisconnected: 'Google Calendar נותק',
    googleCalendarDisconnectFailed: 'נכשל בניתוק Google Calendar',
    conversationsDeleted: 'שיחות נמחקו',
    conversationsDeleteFailed: 'נכשל במחיקת שיחות',
    memoryCleared: 'זיכרון נמחק',
    memoryClearFailed: 'נכשל באיפוס זיכרון',
    accountDeleted: 'חשבון נמחק בהצלחה',
    accountDeleteFailed: 'נכשל במחיקת חשבון',

    // Quick event
    microphoneAccessDenied: 'גישה למיקרופון נדחתה',
    eventCreated: 'אירוע נוצר בהצלחה',

    // Notifications
    reminderPreferencesSaved: 'העדפות תזכורת נשמרו',
    reminderPreferencesSaveFailed: 'נכשל בשמירת העדפות תזכורת',
    soundNotificationsEnabled: 'התראות קוליות הופעלו',
    soundNotificationsDisabled: 'התראות קוליות בוטלו',
    browserNotificationPermissionDenied: 'הרשאת התראות דפדפן נדחתה',
    browserNotificationsEnabled: 'התראות דפדפן הופעלו',
    notificationPreferencesSaved: 'העדפות התראות נשמרו',
    notificationPreferencesSaveFailed: 'נכשל בשמירת העדפות התראות',

    // Daily briefing
    dailyBriefingPreferencesSaved: 'העדפות תדרוך יומי נשמרו',
    dailyBriefingPreferencesSaveFailed: 'נכשל בשמירת העדפות תדרוך יומי',

    // Voice settings
    voiceResponseEnabled: 'תגובות קוליות הופעלו',
    voiceResponseDisabled: 'תגובות קוליות בוטלו',
    voicePreferenceUpdateFailed: 'נכשל בעדכון העדפה קולית',
    voiceChanged: 'קול שונה ל-{{voice}}',
    voiceUpdateFailed: 'נכשל בעדכון קול',
    playbackSpeedChanged: 'מהירות השמעה שונתה ל-{{speed}}x',
    playbackSpeedUpdateFailed: 'נכשל בעדכון מהירות השמעה',
    voicePreviewFailed: 'נכשל בהשמעת תצוגה מקדימה של הקול',

    // Messages
    messageCopied: 'הודעה הועתקה ללוח',
    messageCopyFailed: 'נכשל בהעתקת הודעה',

    // Audio playback
    audioStopped: 'אודיו הופסק',
    audioPlaying: 'מנגן אודיו...',
    audioPlayFailed: 'נכשל בהשמעת אודיו',

    // Date range picker
    dateRangeApplied: 'טווח תאריכים הוחל',
    dateRangeSelectBoth: 'אנא בחר תאריך התחלה וסיום',

    // Calendar creation
    calendarNameRequired: 'אנא הכנס שם ללוח השנה שלך',
    calendarCreated: 'לוח שנה נוצר בהצלחה!',
    calendarCreateFailed: 'נכשל ביצירת לוח שנה',
    calendarCreateFailedGeneric: 'נכשל ביצירת לוח שנה. אנא נסה שוב.',

    // Waiting list
    waitingListWelcome: 'ברוך הבא לרשימת ההמתנה!',
    waitingListError: 'שגיאה',
    waitingList: {
      limitedEarlyAccess: 'גישה מוקדמת מוגבלת',
      titlePart1: 'היומן שלך,',
      titlePart2: 'מקשיב.',
      subtitle:
        "פשוט אמור זאת. אלי מתזמן זאת. בכל מקום - קול, צ'אט, טלגרם וואטסאפ. ללא טפסים. ללא חיכוך. רק אתה והזמן שלך, סוף סוף עובדים יחד.",
      namePlaceholder: 'השם שלך (אופציונלי)',
      emailPlaceholder: 'אימייל',
      joining: 'מצטרף...',
      getEarlyAccess: 'קבל גישה מוקדמת',
      positionMessage: 'אתה #{{position}} ברשימת ההמתנה!',
      footerText: 'הצטרף ליותר מ-2,000 מקצוענים שמשיבים את הזמן שלהם. נודיע לך ברגע שתהיה בתור.',
      footerTitle: 'העתיד של התזמון',
      trustIndicators: {
        security: 'אבטחה ברמה ארגונית',
        speed: 'תגובה תת-שנייה',
        timeSaved: 'חוסך 5+ שעות שבועיות',
      },
      platforms: {
        voice: 'קול',
        chat: "צ'אט אינטרנט",
        telegram: 'טלגרם',
        whatsapp: 'וואטסאפ',
      },
    },

    // Admin
    userImpersonationFailed: 'נכשל בחיקוי משתמש',
    userSessionsRevoked: 'סשני משתמש בוטלו',
    userSessionsRevokeFailed: 'נכשל בביטול סשנים',

    // Broadcast
    broadcastTitleRequired: 'כותרת והודעה נדרשים',
    broadcastSent: 'שידור נשלח ל-{{count}} משתמשים',
    broadcastSendFailed: 'נכשל בשליחת שידור',

    // Billing
    alreadyOnFreePlan: 'אתה כבר בתוכנית החינמית',
    billingPortalOpenFailed: 'נכשל בפתיחת פורטל חיוב',
    checkoutProcessFailed: 'נכשל בעיבוד התשלום. אנא נסה שוב.',
    redirectingToCheckout: 'מפנה לתשלום להגדרת חיוב...',

    // Voice preview
    voicePreviewError: 'נכשל בהשמעת תצוגה מקדימה של הקול',

    // Chat input
    maxImagesAllowed: 'מקסימום {{count}} תמונות מותרות',
    imageProcessingFailed: 'נכשל בעיבוד תמונות',
    unsupportedImageType: 'סוג תמונה לא נתמך: {{type}}',
    imageTooLarge: 'תמונה גדולה מדי (מקסימום {{size}}MB)',
    pastedImagesProcessingFailed: 'נכשל בעיבוד תמונות מודבקות',
  },

  // UI Text
  ui: {
    // Common UI elements
    stop: 'עצור',
    voice: 'קול',
    time: 'זמן',
    organizer: 'מארגן',
    created: 'נוצר',
    transactionId: 'מזהה עסקה',
    noInvoiceAvailable: 'אין חשבונית זמינה',
    noTransactionsYet: 'אין עסקאות עדיין',
    date: 'תאריך',
    description: 'תיאור',
    amount: 'סכום',
    status: 'סטטוס',
    invoice: 'חשבונית',
    totalGaps: 'סה"כ פערים',
    highConfidence: 'ביטחון גבוה',
    potentialHours: 'שעות פוטנציאליות',
    avgGapSize: 'גודל פערים ממוצע',
    analysisPeriod: 'תקופת ניתוח',
    chat: "צ'אט",
    gaps: 'פערים',
    analytics: 'ניתוחים',
    settings: 'הגדרות',
    after: 'אחרי:',
    before: 'לפני:',
    fillGap: 'מלא פערים עם אירוע',
    eventTitle: 'כותרת אירוע *',
    skipThisGap: 'דלג על פערים זה',
    reason: 'סיבה (אופציונלי)',
    integrations: 'אינטגרציות',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    slack: 'Slack',
    googleCalendar: 'Google Calendar',
    failedToLoadCalendarData: 'נכשל בטעינת נתוני לוח שנה.',
    noActiveCalendarSourcesFound: 'לא נמצאו מקורות לוח שנה פעילים.',
    connectWhatsApp: 'חבר WhatsApp',
    neuralLinks: 'קישורים נוירונים',
    executiveGradeAI:
      'עוזר הAI ברמה מנהלתית שנועד לבעלי עסקים להגן על עבודתם העמוקה. מגישה חקירה חינמית לכוח מנהלתית בלתי מוגבל. בנוי על פרוטוקול הנוירונים של Ally.',
    systemOnline: 'כל המערכות תקינות',
    systemOffline: 'המערכת לא זמינה',
    systemChecking: 'בודק סטטוס...',
    chatOnTelegram: 'שוחח עם Ally בTelegram',
    checkingServices: 'בודק שירותים...',
    serverUnreachable: 'שרת לא נגיש',
    serverOnline: 'שרת מקוון',
    uptime: 'זמן פעולה',
    websockets: 'WebSockets',
    connections: 'חיבורים',
    privacyPolicy: 'מדיניות פרטיות',
    termsOfService: 'תנאי שירות',
    product: 'מוצר',
    pricing: 'תמחור',
    executivePower: 'כוח מנהלתית',
    company: 'חברה',
    aboutUs: 'אודותינו',
    careers: 'קריירה',
    resources: 'משאבים',
    blog: 'יומן שינויים',
    changeLog: 'יומן שינויים',
  },

  // Integrations
  integrations: {
    title: 'אינטגרציות',
    description: 'חבר ונהל את מרחב העבודה המנהלי שלך.',
    telegram: {
      title: 'Telegram',
      description: 'תקשר עם אלי ישירות דרך הבוט שלך בטלגרם.',
      settings: 'הגדרות',
    },
    whatsapp: {
      title: 'WhatsApp',
      description: 'סנכרן את אלי עם WhatsApp להעברה מאובטחת של הודעות.',
      connect: 'חבר',
    },
    slack: {
      title: 'Slack',
      description: 'הוסף את אלי למרחב העבודה שלך ב-Slack לניהול לוח שנה קבוצתי.',
      addToSlack: 'הוסף ל-Slack',
      refresh: 'רענן',
    },
    googleCalendar: {
      title: 'Google Calendar',
      description: 'סנכרן את היומנים שלך עם אלי לתזמון חלק ופתרון קונפליקטים.',
      failedToLoad: 'נכשל בטעינת נתוני לוח שנה.',
      noSources: 'לא נמצאו מקורות לוח שנה פעילים.',
      fetchingCalendars: 'מביא יומנים...',
      syncedSources: 'מקורות מסונכרנים',
      manage: 'נהל',
      tryAgain: 'נסה שוב',
      apiActive: 'API פעיל',
      unnamed: 'יומן ללא שם',
    },
    status: {
      connected: 'מחובר',
      disconnected: 'מנותק',
      notConnected: 'לא מחובר',
    },
    connectWhatsApp: 'חבר WhatsApp',
    whatsappModalDescription: 'כדי לחבר WhatsApp, אנא עקוב אחרי ההוראות בקונסול של Ally Node.',
    openConsole: 'פתח קונסול',
    refresh: 'רענן',
  },

  // Admin
  admin: {
    grantCredits: {
      title: 'הענק קרדיטים',
      description: 'הוסף קרדיטים לחשבון של {{user}}',
      creditAmount: 'כמות קרדיטים',
      creditPlaceholder: 'הכנס מספר קרדיטים',
      currentBalance: 'יתרה נוכחית: {{count}} קרדיטים',
      reasonLabel: 'סיבה (אופציונלי)',
      reasonPlaceholder: 'למשל: פיצוי עבור בעיית שירות, בונוס קידומי...',
      auditNote: 'זה יירשם למטרות ביקורת',
      cancel: 'ביטול',
      granting: 'מעניק...',
      grantCredits: 'הענק קרדיטים',
      invalidAmount: 'אנא הכנס כמות קרדיטים תקינה',
      success: '{{count}} קרדיטים הוענקו בהצלחה ל-{{email}}',
      failed: 'נכשל בהענקת קרדיטים: {{error}}',
    },
  },

  subscriptionBanner: {
    trialEndsIn: 'תקופת הניסיון מסתיימת בעוד {{time}}',
    upgradeNow: 'שדרג עכשיו',
  },
} as const
