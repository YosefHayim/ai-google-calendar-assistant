import type { TranslationShape } from './en'

export const ar: TranslationShape = {
  common: {
    loading: 'جاري التحميل...',
    error: 'حدث خطأ ما',
    retry: 'حاول مرة أخرى',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    close: 'إغلاق',
    refresh: 'تحديث',
    back: 'رجوع',
    next: 'التالي',
    submit: 'إرسال',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    update: 'تحديث',
    search: 'بحث',
    noData: 'لا توجد بيانات',
    comingSoon: 'قريباً',
    online: 'متصل',
    offline: 'غير متصل',
  },

  auth: {
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signOut: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
  },

  navbar: {
    home: 'الرئيسية',
    about: 'حول',
    pricing: 'الأسعار',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    getStarted: 'ابدأ الآن',
    language: 'اللغة',
  },

  hero: {
    title: 'مساعدك الذكي لتقويم جوجل',
    subtitle: 'أخبرني بما تحتاج بلغة طبيعية - سأتولى الباقي.',
    cta: 'ابدأ مجاناً',
  },

  features: {
    title: 'كيف يساعدك Ally',
    schedule: 'جدولة وحماية',
    query: 'استعلم عن وقتك',
    insights: 'رؤى الوقت',
  },

  footer: {
    rights: 'جميع الحقوق محفوظة.',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
  },

  sidebar: {
    assistant: 'المساعد',
    assistantDescription: 'تحدث مع مساعدك الذكي لإدارة الأحداث والجداول',
    analytics: 'التحليلات',
    analyticsDescription: 'عرض رؤى حول توزيع الوقت وأنماط الأحداث واتجاهات الإنتاجية',
    gapRecovery: 'استعادة الفجوات',
    gapRecoveryDescription: 'اكتشف واستعد فجوات الوقت غير المسجلة في تقويمك',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    chatWithAlly: 'تحدث مع Ally',
    minimize: 'تصغير',
  },

  dashboard: {
    welcome: 'مرحباً بعودتك',
    today: 'اليوم',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    settings: 'الإعدادات',
    analytics: 'التحليلات',
    calendars: 'التقويمات',
  },

  analytics: {
    title: 'التحليلات',
    dateRange: 'نطاق التاريخ',
    refresh: 'تحديث',
    analyzing: 'جاري تحليل التقويم...',

    stats: {
      productivityScore: 'نقاط الإنتاجية',
      productivityDescription: 'بناءً على حمل الاجتماعات ووقت التركيز وتوزيع الأحداث',
      meetingLoad: 'حمل الاجتماعات',
      focusTime: 'وقت التركيز',
      totalEvents: 'إجمالي الأحداث',
      daysWithEvents: 'أيام بها أحداث',
      totalHours: 'إجمالي الساعات',
      avgPerEvent: 'متوسط {{value}} ساعة لكل حدث',
      avgPerDay: 'متوسط/يوم',
      eventsPerDay: 'أحداث في اليوم',
      peakHour: 'ساعة الذروة',
      mostScheduledTime: 'الوقت الأكثر جدولة',
      focusBlocks: 'فترات التركيز',
      focusBlocksDescription: 'فترات 2+ ساعة متاحة',
      busiestDay: 'أكثر الأيام انشغالاً',
      longestEvent: 'أطول حدث',
      longestSingleEvent: 'أطول حدث فردي',
      freeDays: 'أيام فارغة',
      daysWithoutEvents: 'أيام بدون أحداث',
      allDay: 'طوال اليوم',
      allDayEvents: 'أحداث طوال اليوم',
      recurring: 'متكرر',
      recurringEvents: 'أحداث متكررة',
    },

    charts: {
      dailyHours: 'الساعات اليومية المتاحة',
      dailyHoursDescription: 'الساعات المتبقية بعد الأحداث المجدولة كل يوم.',
      dailyHoursTooltip:
        'يعرض ساعاتك المتاحة المتبقية كل يوم بعد الأحداث المجدولة. بناءً على {{hours}} ساعة استيقاظ يومياً (بافتراض ~8 ساعات نوم)، مطروحاً منها الوقت في أحداث التقويم.',
      totalAvailable: 'إجمالي المتاح',
      dailyAvg: 'المتوسط اليومي',

      weeklyPattern: 'النمط الأسبوعي',
      weeklyPatternDescription: 'شاهد كيف تتوزع أحداثك على مدار الأسبوع.',
      weeklyPatternTooltip:
        'يجمع جميع الأحداث من نطاق التاريخ المحدد حسب يوم الأسبوع لإظهار نمطك الأسبوعي النموذجي. انقر على يوم لرؤية أحداث ذلك اليوم.',
      totalHours: 'إجمالي الساعات',
      totalEventsLabel: 'إجمالي الأحداث',

      monthlyPattern: 'النمط الشهري',
      monthlyPatternDescription: 'كيف يتوزع وقتك على مدار الشهر.',
      monthlyPatternTooltip:
        'يعرض توزيع الأحداث عبر أسابيع الشهر. الأسبوع 1 هو الأيام 1-7، الأسبوع 2 هو الأيام 8-14، إلخ.',

      eventDuration: 'مدة الأحداث',
      eventDurationDescription: 'تقسيم أحداثك حسب المدة.',
      eventDurationTooltip: 'يصنف أحداثك حسب مدتها لمساعدتك على فهم كيفية توزيع وقتك.',

      timeAllocation: 'توزيع الوقت',
      timeAllocationDescription: 'شاهد أين يذهب وقتك عبر التقويمات المختلفة.',
      timeAllocationTooltip: 'يعرض كيف يتوزع وقتك المجدول عبر التقويمات المختلفة. انقر على تقويم لرؤية أحداثه.',

      timeDistribution: 'توزيع الوقت',
      timeDistributionDescription: 'نظرة عامة مرئية لنشاط تقويمك.',
    },

    chartTypes: {
      bar: 'أعمدة',
      line: 'خطي',
      area: 'مساحة',
      stacked: 'مكدس',
      pie: 'دائري',
      donut: 'حلقي',
      radar: 'راداري',
      horizontal: 'أفقي',
      progress: 'تقدم',
    },

    insights: {
      title: 'رؤى الذكاء الاصطناعي',
      loading: 'جاري إنشاء الرؤى...',
      error: 'تعذر إنشاء الرؤى',
    },

    calendars: {
      title: 'تقويماتك',
      manage: 'إدارة التقويمات',
      create: 'إنشاء تقويم',
      settings: 'إعدادات التقويم',
      events: 'أحداث',
      hours: 'ساعات',
    },

    recentEvents: {
      title: 'الأحداث الأخيرة',
      noEvents: 'لا توجد أحداث حديثة',
      viewAll: 'عرض الكل',
    },
  },

  chat: {
    placeholder: 'اسأل أي شيء عن تقويمك...',
    send: 'إرسال',
    recording: 'جاري التسجيل...',
    stopRecording: 'إيقاف التسجيل',
    cancelRecording: 'إلغاء',
    startRecording: 'بدء الإدخال الصوتي',
    thinking: 'Ally يفكر...',
    emptyState: 'لا توجد رسائل بعد. ابدأ محادثة!',
    errorMessage: 'خطأ في معالجة طلبك.',

    views: {
      chat: 'محادثة',
      avatar: 'ثنائي الأبعاد',
      threeDee: 'ثلاثي الأبعاد',
      threeDeeComingSoon: 'ثلاثي الأبعاد (قريباً)',
    },

    actions: {
      resend: 'إعادة تعيين / إرسال مرة أخرى',
      edit: 'تعديل وإرسال مرة أخرى',
      speak: 'استمع للرسالة',
      hearResponse: 'استمع للرد',
      copy: 'نسخ',
      copied: 'تم النسخ!',
    },

    ally: {
      name: 'Ally',
      badge: 'ذكاء اصطناعي',
      online: 'متصل',
      chatWith: 'تحدث مع Ally',
    },
  },

  gaps: {
    title: 'استعادة الفجوات',
    description: 'اكتشف الوقت غير المسجل في تقويمك',
    analyzing: 'جاري تحليل التقويم...',

    header: {
      found: 'تم العثور على {{count}} فجوات',
      analyzedRange: 'تم التحليل من {{start}} إلى {{end}}',
      refresh: 'تحديث',
      dismissAll: 'تجاهل الكل',
    },

    states: {
      loading: 'جاري تحليل التقويم...',
      error: {
        title: 'تعذر تحميل الفجوات',
        description: 'لم نتمكن من تحليل تقويمك. يرجى المحاولة مرة أخرى.',
        retry: 'إعادة المحاولة',
      },
      empty: {
        title: 'كل شيء محدث!',
        description: 'يبدو تقويمك منظماً جيداً. سيخبرك Ally عند اكتشاف فجوات زمنية جديدة.',
      },
    },

    card: {
      availableTimeSlot: 'فترة زمنية متاحة',
      betweenEvents: 'بين الأحداث',
      freeTime: 'وقت فراغ',
      suggestion: 'اقتراح Ally',
      scheduleEvent: 'جدولة حدث',
      skip: 'تخطي',
      skipTooltip: 'تجاهل هذه الفجوة حالياً',
    },

    confidence: {
      high: 'ثقة عالية',
      highTooltip: 'Ally واثق أن هذه فجوة حقيقية في جدولك',
      medium: 'ثقة متوسطة',
      mediumTooltip: 'قد يكون هذا وقت فراغ متعمد - راجع قبل الجدولة',
      low: 'ثقة منخفضة',
      lowTooltip: 'قد يكون هذا متعمداً - Ally أقل يقيناً بشأن هذه الفجوة',
    },

    dialog: {
      title: 'ملء هذه الفجوة',
      eventName: 'اسم الحدث',
      eventNamePlaceholder: 'أدخل اسم الحدث',
      description: 'الوصف (اختياري)',
      descriptionPlaceholder: 'أضف وصفاً...',
      calendar: 'التقويم',
      creating: 'جاري الإنشاء...',
      create: 'إنشاء حدث',
    },
  },

  settings: {
    title: 'الإعدادات',
    profile: 'الملف الشخصي',
    preferences: 'التفضيلات',
    notifications: 'الإشعارات',
    integrations: 'التكاملات',
    language: 'اللغة',
    theme: 'المظهر',
    themeLight: 'فاتح',
    themeDark: 'داكن',
    themeSystem: 'النظام',
  },

  dialogs: {
    eventDetails: {
      title: 'تفاصيل الحدث',
      noDescription: 'لا يوجد وصف',
      allDay: 'طوال اليوم',
      location: 'الموقع',
      attendees: 'المشاركون',
      calendar: 'التقويم',
      openInGoogle: 'فتح في تقويم جوجل',
    },
    dayEvents: {
      title: 'أحداث {{date}}',
      noEvents: 'لا توجد أحداث في هذا اليوم',
      totalHours: '{{hours}} ساعات مجدولة',
    },
    calendarEvents: {
      title: 'أحداث {{calendar}}',
      totalHours: '{{hours}} ساعات إجمالاً',
    },
    calendarSettings: {
      title: 'إعدادات التقويم',
      color: 'اللون',
      visibility: 'الرؤية',
      notifications: 'الإشعارات',
    },
    createCalendar: {
      title: 'إنشاء تقويم جديد',
      name: 'اسم التقويم',
      namePlaceholder: 'أدخل اسم التقويم',
      description: 'الوصف',
      descriptionPlaceholder: 'أضف وصفاً...',
      color: 'اللون',
      creating: 'جاري الإنشاء...',
      create: 'إنشاء تقويم',
    },
  },

  onboarding: {
    welcome: 'مرحباً بك في Ally',
    step1: {
      title: 'تعرف على مساعدك',
      description: 'تحدث مع Ally لإدارة تقويمك باستخدام اللغة الطبيعية.',
    },
    step2: {
      title: 'عرض تحليلاتك',
      description: 'احصل على رؤى حول كيفية قضاء وقتك.',
    },
    step3: {
      title: 'استعد الوقت الضائع',
      description: 'ابحث عن الفجوات في جدولك واملأها.',
    },
    getStarted: 'ابدأ',
    skip: 'تخطي الجولة',
    next: 'التالي',
    previous: 'السابق',
    finish: 'إنهاء',
  },

  time: {
    hours: 'ساعات',
    hoursShort: 'س',
    minutes: 'دقائق',
    minutesShort: 'د',
    days: 'أيام',
    weeks: 'أسابيع',
    months: 'أشهر',
  },

  days: {
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sun: 'أحد',
    mon: 'إثن',
    tue: 'ثلا',
    wed: 'أرب',
    thu: 'خمي',
    fri: 'جمع',
    sat: 'سبت',
  },

  errors: {
    generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    network: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
    unauthorized: 'يرجى تسجيل الدخول للمتابعة.',
    notFound: 'لم يتم العثور على المورد المطلوب.',
    serverError: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
  },
} as const
