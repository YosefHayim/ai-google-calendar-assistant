export const en = {
  // Common/shared strings
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    noData: 'No data available',
    comingSoon: 'Coming Soon',
    online: 'Online',
    offline: 'Offline',
  },

  // Authentication
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
  },

  // Marketing/Navbar
  navbar: {
    home: 'Home',
    about: 'About',
    pricing: 'Pricing',
    contact: 'Contact',
    login: 'Login',
    getStarted: 'Get Started',
    language: 'Language',
  },

  // Hero Section
  hero: {
    title: 'Your AI Secretary for Google Calendar',
    subtitle: 'Tell me what you need in plain language - I will handle the rest.',
    cta: 'Get Started Free',
  },

  // Features Section
  features: {
    title: 'How Ally Helps',
    schedule: 'Schedule & Protect',
    query: 'Query Your Time',
    insights: 'Time Insights',
  },

  // Footer
  footer: {
    rights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  },

  // Sidebar Navigation
  sidebar: {
    assistant: 'Assistant',
    assistantDescription: 'Chat with your AI calendar assistant to manage events and schedules',
    analytics: 'Analytics',
    analyticsDescription: 'View insights on time allocation, event patterns, and productivity trends',
    gapRecovery: 'Gap Recovery',
    gapRecoveryDescription: 'Discover and recover untracked time gaps in your calendar',
    settings: 'Settings',
    logout: 'Logout',
    chatWithAlly: 'Chat with Ally',
    minimize: 'Minimize',
  },

  // Dashboard
  dashboard: {
    welcome: 'Welcome back',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    settings: 'Settings',
    analytics: 'Analytics',
    calendars: 'Calendars',
  },

  // Analytics Dashboard
  analytics: {
    title: 'Analytics',
    dateRange: 'Date Range',
    refresh: 'Refresh',
    analyzing: 'Analyzing your calendar...',

    // Stats labels
    stats: {
      productivityScore: 'Productivity Score',
      productivityDescription: 'Based on meeting load, focus time, and event distribution',
      meetingLoad: 'Meeting Load',
      focusTime: 'Focus Time',
      totalEvents: 'Total Events',
      daysWithEvents: 'days with events',
      totalHours: 'Total Hours',
      avgPerEvent: 'Avg {{value}}H per event',
      avgPerDay: 'Avg/Day',
      eventsPerDay: 'events per day',
      peakHour: 'Peak Hour',
      mostScheduledTime: 'most scheduled time',
      focusBlocks: 'Focus Blocks',
      focusBlocksDescription: '2+ hour blocks available',
      busiestDay: 'Busiest Day',
      longestEvent: 'Longest Event',
      longestSingleEvent: 'longest single event',
      freeDays: 'Free Days',
      daysWithoutEvents: 'days without events',
      allDay: 'All-Day',
      allDayEvents: 'all-day events',
      recurring: 'Recurring',
      recurringEvents: 'recurring events',
    },

    // Chart titles and descriptions
    charts: {
      dailyHours: 'Daily Available Hours',
      dailyHoursDescription: 'Hours remaining after scheduled events each day.',
      dailyHoursTooltip:
        'Shows your available hours remaining each day after scheduled events. Based on {{hours}} waking hours per day (assuming ~8 hours of sleep), minus time spent in calendar events.',
      totalAvailable: 'Total Available',
      dailyAvg: 'Daily Avg',

      weeklyPattern: 'Weekly Pattern',
      weeklyPatternDescription: 'See how your events are distributed across the week.',
      weeklyPatternTooltip:
        "Aggregates all events from the selected date range by day of the week to show your typical weekly pattern. Click on a day to see that day's events.",
      totalHours: 'Total Hours',
      totalEventsLabel: 'Total Events',

      monthlyPattern: 'Monthly Pattern',
      monthlyPatternDescription: 'How your time is distributed throughout the month.',
      monthlyPatternTooltip:
        'Shows event distribution across weeks of the month. Week 1 is days 1-7, Week 2 is days 8-14, etc.',

      eventDuration: 'Event Duration',
      eventDurationDescription: 'Breakdown of your events by duration.',
      eventDurationTooltip:
        'Categorizes your events by their duration to help you understand how your time is allocated.',

      timeAllocation: 'Time Allocation',
      timeAllocationDescription: 'See where your time goes across different calendars.',
      timeAllocationTooltip:
        'Shows how your scheduled time is distributed across different calendars. Click on a calendar to see its events.',

      timeDistribution: 'Time Distribution',
      timeDistributionDescription: 'Visual overview of your calendar activity.',
    },

    // Chart type labels
    chartTypes: {
      bar: 'Bar',
      line: 'Line',
      area: 'Area',
      stacked: 'Stacked',
      pie: 'Pie',
      donut: 'Donut',
      radar: 'Radar',
      horizontal: 'Horizontal',
      progress: 'Progress',
    },

    // Insights
    insights: {
      title: 'AI Insights',
      loading: 'Generating insights...',
      error: 'Unable to generate insights',
    },

    // Calendar management
    calendars: {
      title: 'Your Calendars',
      manage: 'Manage Calendars',
      create: 'Create Calendar',
      settings: 'Calendar Settings',
      events: 'events',
      hours: 'hours',
    },

    // Recent events
    recentEvents: {
      title: 'Recent Events',
      noEvents: 'No recent events',
      viewAll: 'View All',
    },
  },

  // Chat Interface
  chat: {
    placeholder: 'Ask anything about your calendar...',
    send: 'Send',
    recording: 'Recording...',
    stopRecording: 'Stop recording',
    cancelRecording: 'Cancel',
    startRecording: 'Start voice input',
    thinking: 'Ally is thinking...',
    emptyState: 'No messages yet. Start a conversation!',
    errorMessage: 'Error processing your request.',

    // View switcher
    views: {
      chat: 'Chat',
      avatar: '2D',
      threeDee: '3D',
      threeDeeComingSoon: '3D (Coming Soon)',
    },

    // Message actions
    actions: {
      resend: 'Reset / Re-trigger',
      edit: 'Edit & Resend',
      speak: 'Hear message',
      hearResponse: 'Hear response',
      copy: 'Copy',
      copied: 'Copied!',
    },

    // AI Sidebar
    ally: {
      name: 'Ally',
      badge: 'AI',
      online: 'Online',
      chatWith: 'Chat with Ally',
    },
  },

  // Gap Recovery
  gaps: {
    title: 'Gap Recovery',
    description: 'Discover untracked time in your calendar',
    analyzing: 'Analyzing your calendar...',

    // Header
    header: {
      found: '{{count}} gaps found',
      analyzedRange: 'Analyzed from {{start}} to {{end}}',
      refresh: 'Refresh',
      dismissAll: 'Dismiss All',
    },

    // States
    states: {
      loading: 'Analyzing your calendar...',
      error: {
        title: 'Unable to Load Gaps',
        description: "We couldn't analyze your calendar. Please try again.",
        retry: 'Retry',
      },
      empty: {
        title: 'All Caught Up!',
        description: 'Your calendar looks well-organized. Ally will notify you when new time gaps are detected.',
      },
    },

    // Gap card
    card: {
      availableTimeSlot: 'Available Time Slot',
      betweenEvents: 'Between Events',
      freeTime: 'Free time',
      suggestion: "Ally's Suggestion",
      scheduleEvent: 'Schedule Event',
      skip: 'Skip',
      skipTooltip: 'Ignore this gap for now',
    },

    // Confidence levels
    confidence: {
      high: 'High confidence',
      highTooltip: 'Ally is confident this is a genuine gap in your schedule',
      medium: 'Medium confidence',
      mediumTooltip: 'This might be intentional free time - review before scheduling',
      low: 'Low confidence',
      lowTooltip: 'This could be intentional - Ally is less certain about this gap',
    },

    // Fill dialog
    dialog: {
      title: 'Fill This Gap',
      eventName: 'Event Name',
      eventNamePlaceholder: 'Enter event name',
      description: 'Description (optional)',
      descriptionPlaceholder: 'Add a description...',
      calendar: 'Calendar',
      creating: 'Creating...',
      create: 'Create Event',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    profile: 'Profile',
    preferences: 'Preferences',
    notifications: 'Notifications',
    integrations: 'Integrations',
    language: 'Language',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
  },

  // Dialogs
  dialogs: {
    eventDetails: {
      title: 'Event Details',
      noDescription: 'No description',
      allDay: 'All day',
      location: 'Location',
      attendees: 'Attendees',
      calendar: 'Calendar',
      openInGoogle: 'Open in Google Calendar',
    },
    dayEvents: {
      title: 'Events on {{date}}',
      noEvents: 'No events on this day',
      totalHours: '{{hours}} hours scheduled',
    },
    calendarEvents: {
      title: '{{calendar}} Events',
      totalHours: '{{hours}} total hours',
    },
    calendarSettings: {
      title: 'Calendar Settings',
      color: 'Color',
      visibility: 'Visibility',
      notifications: 'Notifications',
    },
    createCalendar: {
      title: 'Create New Calendar',
      name: 'Calendar Name',
      namePlaceholder: 'Enter calendar name',
      description: 'Description',
      descriptionPlaceholder: 'Add a description...',
      color: 'Color',
      creating: 'Creating...',
      create: 'Create Calendar',
    },
  },

  // Onboarding
  onboarding: {
    welcome: 'Welcome to Ally',
    step1: {
      title: 'Meet Your Assistant',
      description: 'Chat with Ally to manage your calendar using natural language.',
    },
    step2: {
      title: 'View Your Analytics',
      description: 'Get insights on how you spend your time.',
    },
    step3: {
      title: 'Recover Lost Time',
      description: 'Find and fill gaps in your schedule.',
    },
    getStarted: 'Get Started',
    skip: 'Skip Tour',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
  },

  // Time/Date formatting
  time: {
    hours: 'hours',
    hoursShort: 'H',
    minutes: 'minutes',
    minutesShort: 'm',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
  },

  // Days of week
  days: {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
  },

  // Errors
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'Please sign in to continue.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
  },
} as const

export type TranslationKeys = typeof en

// Deep partial for translations - allows any string values
type DeepTranslationShape<T> = {
  [K in keyof T]: T[K] extends object ? DeepTranslationShape<T[K]> : string
}

export type TranslationShape = DeepTranslationShape<TranslationKeys>
