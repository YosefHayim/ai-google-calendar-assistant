import type { TranslationShape } from './en'

export const ru: TranslationShape = {
  common: {
    loading: 'Загрузка...',
    error: 'Что-то пошло не так',
    retry: 'Попробовать снова',
    save: 'Сохранить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    close: 'Закрыть',
    refresh: 'Обновить',
    back: 'Назад',
    next: 'Далее',
    submit: 'Отправить',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    update: 'Обновить',
    search: 'Поиск',
    noData: 'Нет данных',
    comingSoon: 'Скоро',
    online: 'Онлайн',
    offline: 'Офлайн',
  },

  auth: {
    signIn: 'Войти',
    signUp: 'Регистрация',
    signOut: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    forgotPassword: 'Забыли пароль?',
    noAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
  },

  navbar: {
    home: 'Главная',
    about: 'О нас',
    pricing: 'Цены',
    contact: 'Контакты',
    login: 'Вход',
    getStarted: 'Начать',
    language: 'Язык',
  },

  hero: {
    title: 'Ваш ИИ-секретарь для Google Календаря',
    subtitle: 'Расскажите, что вам нужно простым языком - я позабочусь об остальном.',
    cta: 'Начать бесплатно',
  },

  features: {
    title: 'Как Ally помогает',
    schedule: 'Планируйте и защищайте',
    query: 'Управляйте временем',
    insights: 'Аналитика времени',
  },

  footer: {
    rights: 'Все права защищены.',
    privacy: 'Политика конфиденциальности',
    terms: 'Условия использования',
    product: 'Продукт',
    pricing: 'Цены',
    executivePower: 'Executive Power',
    company: 'Компания',
    aboutUs: 'О нас',
    careers: 'Карьера',
    resources: 'Ресурсы',
    blog: 'Блог',
    changeLog: 'Журнал изменений',
    description:
      'ИИ-ассистент для руководителей, созданный для защиты вашего глубокого рабочего времени. От бесплатного доступа до неограниченной мощности. Построен на протоколе Ally Neural.',
    systemOnline: 'Все системы работают',
    systemOffline: 'Система недоступна',
    systemChecking: 'Проверка статуса...',
    chatOnTelegram: 'Чат с Ally в Telegram',
    checkingServices: 'Проверка сервисов...',
    serverUnreachable: 'Сервер недоступен',
    serverOnline: 'Сервер онлайн',
    uptime: 'Время работы',
    websockets: 'WebSockets',
    connections: 'подключений',
    telegram: 'Telegram',
    slack: 'Slack',
  },

  home: {
    badge: 'Управление календарём с ИИ',
    title: 'Ваш личный',
    titleHighlight: 'ИИ-секретарь',
    subtitle:
      'Управляйте своим Google Календарём с помощью голосовых команд. Планируйте, переносите и оптимизируйте своё время без усилий.',
    getStartedFree: 'Начать бесплатно',
    viewPricing: 'Посмотреть цены',
    featuresTitle: 'Всё, что нужно для управления временем',
    featuresSubtitle: 'Ally сочетает ИИ-интеллект с бесшовной интеграцией календаря',
    voiceCommands: 'Голосовые команды',
    voiceCommandsDesc: 'Планируйте встречи, устанавливайте напоминания и управляйте календарём с помощью голоса.',
    smartScheduling: 'Умное планирование',
    smartSchedulingDesc: 'ИИ-планирование, которое находит лучшее время для ваших встреч.',
    timeOptimization: 'Оптимизация времени',
    timeOptimizationDesc: 'Анализируйте паттерны расписания и получайте инсайты для максимальной продуктивности.',
    ctaTitle: 'Готовы преобразить работу с календарём?',
    ctaSubtitle: 'Присоединяйтесь к тысячам профессионалов, которые упростили планирование с Ally.',
    startForFree: 'Начать бесплатно',
    telegramTitle: 'Чат с Ally в Telegram',
    telegramDescription:
      'Управляйте календарём на ходу. Отправляйте голосовые сообщения, планируйте события и получайте напоминания, всё в Telegram.',
    openTelegram: 'Открыть в Telegram',
    availableIn: 'Доступно в',
  },

  // Feature Showcase
  showcase: {
    badge: 'Живая демо',
    title: 'Смотрите Ally в действии',
    subtitle: 'Испытайте плавное управление календарём через Telegram и веб',
    today: {
      title: 'Расписание на сегодня',
      description:
        'Получите полный обзор дня с /today. Смотрите все встречи, блоки фокуса и свободное время одним взглядом.',
    },
    voice: {
      title: 'Голосовые команды',
      description:
        'Отправляйте голосовые сообщения для управления календарём без рук. Ally транскрибирует и выполняет ваши запросы мгновенно.',
    },
    analytics: {
      title: 'Аналитика времени',
      description:
        'Отслеживайте продуктивность с /analytics. Смотрите время фокуса, загрузку встречами и недельные тренды для оптимизации расписания.',
    },
    brain: {
      title: 'Ally Brain',
      description:
        'Научите Ally вашим предпочтениям с /brain. Установите правила как "никаких встреч до 10 утра" и Ally запомнит.',
    },
    search: {
      title: 'Умный поиск',
      description:
        'Находите прошлые встречи мгновенно. Спросите "Когда я в последний раз встречался с Сарой?" и получите точные ответы с контекстом.',
    },
    create: {
      title: 'Быстрое создание',
      description:
        'Планируйте события на естественном языке. Просто скажите "Обед с Алексом завтра в полдень" и подтвердите.',
    },
    language: {
      title: 'Многоязычность',
      description:
        'Используйте Ally на предпочитаемом языке с /language. Поддерживает английский, иврит, русский, французский, немецкий и арабский.',
    },
  },

  about: {
    heroBadge: 'Скрытая цена хаоса',
    heroTitle: 'Ваше время',
    heroTitleHighlight: 'под атакой',
    heroSubtitle:
      'Каждое переключение контекста, каждый конфликт в расписании, каждый час на админ-работу. Всё накапливается. Время это единственный ресурс, который нельзя вернуть.',

    problemTitle: 'Ежедневная борьба',
    problemSubtitle:
      'Современные профессионалы теряют часы каждую неделю из-за хаоса в календаре, который они не просили.',
    problemContextSwitch: 'Переключение контекста',
    problemContextSwitchDesc:
      'Прыжки между приложениями, вкладками и задачами. Каждое переключение стоит 23 минуты фокуса.',
    problemCalendarChaos: 'Хаос в календаре',
    problemCalendarChaosDesc:
      'Двойные бронирования, путаница с часовыми поясами и бесконечная переписка для простой встречи.',
    problemLostHours: 'Потерянные часы',
    problemLostHoursDesc:
      'Административная нагрузка крадёт ваши самые продуктивные часы. Время для глубокой работы исчезает.',
    problemBlindSpots: 'Слепые зоны',
    problemBlindSpotsDesc: 'Куда делся вторник? Пробелы в календаре, которые невозможно объяснить или восстановить.',

    visionBadge: 'Во что мы верим',
    visionTitle: 'Каждый заслуживает личного ИИ-секретаря',
    visionP1:
      'Мы создали Ally, потому что верим: ваш календарь должен работать на вас, а не против. Он должен защищать ваши приоритеты, а не просто записывать их.',
    visionP2:
      'Та же ИИ-технология, что используется в корпоративных решениях, должна быть доступна каждому предпринимателю, руководителю и профессионалу, который ценит своё время.',
    visionBelief1: 'Ваш календарь должен защищать глубокую работу, а не планировать поверх неё.',
    visionBelief2: 'Управление временем должно занимать секунды, а не часы администрирования.',
    visionBelief3: 'Ваши данные принадлежат вам. Никогда не продаются, никогда не используются для обучения.',

    impactTitle: 'Что меняется с Ally',
    impactSubtitle: 'Реальное влияние на то, как вы работаете и живёте.',
    impactHours: 'Часы возвращены',
    impactHoursDesc:
      'Перестаньте терять время на планирование. Верните часы каждую неделю для действительно важной работы.',
    impactFocus: 'Фокус защищён',
    impactFocusDesc: 'Ally защищает ваши блоки глубокой работы от прерываний, интеллектуально перепланируя конфликты.',
    impactGaps: 'Пробелы заполнены',
    impactGapsDesc:
      'Больше не нужно гадать, куда ушло время. Ally находит и помогает заполнить пробелы в вашем календаре.',
    impactVoice: 'Голос в действие',
    impactVoiceDesc:
      'От мысли до запланированного события за секунды. Просто говорите естественно, и Ally сделает остальное.',

    differenceTitle: 'Мы другие по дизайну',
    differenceSubtitle: 'Построены с нуля с другими приоритетами.',
    differencePrivacy: 'Приватность прежде всего',
    differencePrivacyDesc:
      'Ваши данные зашифрованы, никогда не продаются и не используются для обучения ИИ. Ваш личный офис остаётся личным.',
    differenceMultiPlatform: 'Работает там, где вы',
    differenceMultiPlatformDesc:
      'Веб, голос, Telegram, WhatsApp. Ally доступен везде, где вы находитесь, как вам удобно общаться.',
    differenceProactive: 'Проактивный, не пассивный',
    differenceProactiveDesc:
      'Ally не просто записывает расписание. Он защищает ваше время, предлагает оптимизации и автоматически решает конфликты.',

    ctaBadge: 'Присоединяйтесь к движению',
    ctaTitle: 'Верните своё время',
    ctaSubtitle:
      'Перестаньте бороться с календарём. Начните им управлять. Присоединяйтесь к тысячам профессионалов, которые вернули контроль.',
    ctaPrimary: 'Начать бесплатно',
    ctaSecondary: 'Смотреть цены',
  },

  contact: {
    badge: 'Связаться с нами',
    title: 'Свяжитесь с нами',
    subtitle: 'Есть вопрос, отзыв или нужна поддержка? Мы будем рады вам помочь.',
    emailUs: 'Напишите нам',
    emailUsDesc: 'Для общих вопросов и поддержки',
    responseTime: 'Время ответа',
    responseTimeDesc: 'Обычно мы отвечаем в течение 24-48 часов в рабочие дни.',
    form: {
      name: 'Имя',
      namePlaceholder: 'Ваше имя',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      subject: 'Тема',
      subjectPlaceholder: 'Чем мы можем помочь?',
      message: 'Сообщение',
      messagePlaceholder: 'Расскажите подробнее...',
      submit: 'Отправить сообщение',
      submitting: 'Отправка...',
      success: 'Сообщение успешно отправлено!',
      error: 'Не удалось отправить сообщение. Попробуйте снова.',
    },
  },

  pricing: {
    testimonialsTitle: 'Стандарт для стратегического исполнения',
    testimonialsSubtitle:
      'Присоединяйтесь к тысячам лидеров, которые автоматизировали планирование для защиты своего рабочего времени.',
    testimonialsBadge: 'Подтверждённая эффективность',
  },

  login: {
    title: 'С возвращением',
    subtitle: 'Безопасный доступ к вашему личному секретарю.',
    loginWithGoogle: 'Войти через Google',
    connecting: 'Подключение...',
    noAccount: 'Нет аккаунта?',
    signUp: 'Зарегистрироваться',
    errors: {
      noToken: 'Ошибка аутентификации. Попробуйте снова.',
      callbackFailed: 'OAuth callback не удался. Попробуйте снова.',
      sessionExpired: 'Ваша сессия истекла. Пожалуйста, войдите снова.',
      accountDeleted: 'Ваш аккаунт был удалён. Пожалуйста, зарегистрируйтесь снова.',
      accountDeactivated: 'Ваш аккаунт был деактивирован. Пожалуйста, свяжитесь с поддержкой.',
    },
  },

  register: {
    title: 'Присоединяйтесь к Ally',
    subtitle: 'Начните оптимизировать свои операции уже сегодня.',
    signUpWithGoogle: 'Зарегистрироваться через Google',
    connecting: 'Подключение...',
    agreeToTerms: 'Регистрируясь, вы соглашаетесь с',
    termsOfService: 'условиями использования',
    and: 'и',
    privacyPolicy: 'политикой конфиденциальности',
    haveAccount: 'Уже есть аккаунт?',
    login: 'Войти',
  },

  callback: {
    securingConnection: 'Защита соединения...',
    syncingCalendar: 'Синхронизация календаря...',
    preparingWorkspace: 'Подготовка рабочего пространства...',
    almostThere: 'Почти готово...',
    authFailed: 'Ошибка аутентификации',
    somethingWentWrong: 'Что-то пошло не так',
    redirectingToLogin: 'Перенаправление на вход...',
    completingSignIn: 'Завершение входа...',
    tagline: 'Ваш ИИ-ассистент для календаря',
    loading: 'Загрузка...',
    noAccessToken: 'Токен доступа не получен',
  },

  sidebar: {
    assistant: 'Ассистент',
    assistantDescription: 'Общайтесь с ИИ-ассистентом для управления событиями и расписанием',
    admin: 'Админ',
    adminDescription: 'Доступ к панели администратора для управления пользователями, подписками и настройками системы',
    calendar: 'Календарь',
    calendarDescription: 'Просматривайте и управляйте событиями в режимах месяца, недели, дня и списка',
    analytics: 'Аналитика',
    analyticsDescription: 'Просматривайте аналитику по распределению времени, шаблонам событий и продуктивности',
    quickAddEvent: 'Быстрое добавление',
    quickAddEventDescription:
      'Мгновенно создавайте события календаря с помощью естественного языка или голосового ввода',
    gapRecovery: 'Восстановление пробелов',
    gapRecoveryDescription: 'Обнаруживайте и восстанавливайте неотмеченное время в вашем календаре',
    calendars: 'Календари',
    calendarsDescription: 'Управляйте источниками Google Календаря и создавайте новые календари',
    activity: 'Активность',
    activityDescription: 'Просматривайте историю разговоров и прошлые взаимодействия с Ally',
    telegram: 'Telegram',
    telegramDescription: 'Подключите и управляйте интеграцией с Telegram-ботом',
    account: 'Аккаунт',
    accountDescription: 'Управляйте профилем, подключёнными сервисами и настройками аккаунта',
    settings: 'Настройки',
    logout: 'Выйти',
    chatWithAlly: 'Чат с Ally',
    minimize: 'Свернуть',
    // User Footer items
    upgradeToPro: 'Обновить до Pro',
    billing: 'Оплата',
    notifications: 'Уведомления',
    logOut: 'Выйти',
  },

  dashboard: {
    welcome: 'С возвращением',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    thisWeek: 'Эта неделя',
    settings: 'Настройки',
    analytics: 'Аналитика',
    calendars: 'Календари',
  },

  analytics: {
    title: 'Аналитика',
    dateRange: 'Период',
    refresh: 'Обновить',
    analyzing: 'Анализ календаря...',

    calendarFilter: {
      filterByCalendar: 'Фильтр по календарю',
      allCalendars: 'Все календари',
      oneCalendar: '1 Календарь',
      multipleCalendars: '{{count}} Календарей',
      clear: 'Очистить',
      noCalendars: 'Нет доступных календарей',
    },

    stats: {
      productivityScore: 'Оценка продуктивности',
      productivityDescription: 'На основе нагрузки встреч, времени фокусировки и распределения событий',
      meetingLoad: 'Нагрузка встреч',
      focusTime: 'Время фокуса',
      totalEvents: 'Всего событий',
      daysWithEvents: 'дней с событиями',
      totalHours: 'Всего часов',
      avgPerEvent: 'В среднем {{value}}ч на событие',
      avgPerDay: 'Среднее/день',
      eventsPerDay: 'событий в день',
      peakHour: 'Пиковый час',
      mostScheduledTime: 'самое загруженное время',
      focusBlocks: 'Блоки фокуса',
      focusBlocksDescription: 'доступные блоки 2+ часа',
      busiestDay: 'Самый загруженный день',
      longestEvent: 'Самое длинное событие',
      longestSingleEvent: 'самое длинное событие',
      freeDays: 'Свободные дни',
      daysWithoutEvents: 'дней без событий',
      allDay: 'Весь день',
      allDayEvents: 'события на весь день',
      recurring: 'Повторяющиеся',
      recurringEvents: 'повторяющиеся события',
    },

    charts: {
      dailyHours: 'Ежедневные доступные часы',
      dailyHoursDescription: 'Часы, оставшиеся после запланированных событий каждый день.',
      dailyHoursTooltip:
        'Показывает ваши доступные часы каждый день после запланированных событий. На основе {{hours}} часов бодрствования в день (предполагая ~8 часов сна), минус время на события календаря.',
      totalAvailable: 'Всего доступно',
      dailyAvg: 'Среднее за день',

      weeklyPattern: 'Недельный шаблон',
      weeklyPatternDescription: 'Посмотрите, как ваши события распределяются в течение недели.',
      weeklyPatternTooltip:
        'Агрегирует все события из выбранного диапазона дат по дням недели, чтобы показать ваш типичный недельный шаблон. Нажмите на день, чтобы увидеть события этого дня.',
      totalHours: 'Всего часов',
      totalEventsLabel: 'Всего событий',

      monthlyPattern: 'Месячный шаблон',
      monthlyPatternDescription: 'Как ваше время распределяется в течение месяца.',
      monthlyPatternTooltip:
        'Показывает распределение событий по неделям месяца. Неделя 1 - дни 1-7, Неделя 2 - дни 8-14 и т.д.',

      eventDuration: 'Длительность событий',
      eventDurationDescription: 'Разбивка ваших событий по длительности.',
      eventDurationTooltip: 'Категоризирует ваши события по длительности, чтобы помочь понять распределение времени.',

      timeAllocation: 'Распределение времени',
      timeAllocationDescription: 'Посмотрите, куда уходит ваше время по разным календарям.',
      timeAllocationTooltip:
        'Показывает, как ваше запланированное время распределяется по разным календарям. Нажмите на календарь, чтобы увидеть его события.',

      timeDistribution: 'Распределение времени',
      timeDistributionDescription: 'Визуальный обзор активности вашего календаря.',
    },

    chartTypes: {
      bar: 'Столбцы',
      line: 'Линия',
      area: 'Область',
      stacked: 'Стопка',
      pie: 'Круговая',
      donut: 'Кольцевая',
      radar: 'Радар',
      horizontal: 'Горизонтальная',
      progress: 'Прогресс',
    },

    insights: {
      title: 'ИИ-аналитика',
      loading: 'Генерация аналитики...',
      error: 'Не удалось сгенерировать аналитику',
    },

    calendars: {
      title: 'Ваши календари',
      manage: 'Управление календарями',
      create: 'Создать календарь',
      settings: 'Настройки календаря',
      events: 'событий',
      hours: 'часов',
    },

    recentEvents: {
      title: 'Недавние события',
      noEvents: 'Нет недавних событий',
      viewAll: 'Показать все',
    },
  },

  chat: {
    placeholder: 'Спросите что-нибудь о вашем календаре...',
    send: 'Отправить',
    recording: 'Запись...',
    stopRecording: 'Остановить запись',
    cancelRecording: 'Отмена',
    startRecording: 'Начать голосовой ввод',
    thinking: 'Ally думает...',
    emptyState: 'Пока нет сообщений. Начните разговор!',
    errorMessage: 'Ошибка обработки вашего запроса.',

    views: {
      chat: 'Чат',
      avatar: '2D',
      threeDee: '3D',
      threeDeeComingSoon: '3D (Скоро)',
    },

    actions: {
      resend: 'Сброс / Повторить',
      edit: 'Редактировать и отправить',
      speak: 'Прослушать сообщение',
      hearResponse: 'Прослушать ответ',
      copy: 'Копировать',
      copied: 'Скопировано!',
    },

    ally: {
      name: 'Ally',
      badge: 'ИИ',
      online: 'Онлайн',
      chatWith: 'Чат с Ally',
    },
  },

  gaps: {
    title: 'Восстановление пробелов',
    description: 'Обнаружьте неотмеченное время в вашем календаре',
    analyzing: 'Анализ календаря...',

    header: {
      found: 'Найдено {{count}} пробелов',
      analyzedRange: 'Проанализировано с {{start}} по {{end}}',
      refresh: 'Обновить',
      dismissAll: 'Отклонить все',
    },

    states: {
      loading: 'Анализ календаря...',
      error: {
        title: 'Не удалось загрузить пробелы',
        description: 'Не удалось проанализировать ваш календарь. Пожалуйста, попробуйте снова.',
        retry: 'Повторить',
      },
      empty: {
        title: 'Всё актуально!',
        description: 'Ваш календарь хорошо организован. Ally уведомит вас при обнаружении новых пробелов.',
      },
    },

    card: {
      availableTimeSlot: 'Доступный временной слот',
      betweenEvents: 'Между событиями',
      freeTime: 'Свободное время',
      suggestion: 'Предложение Ally',
      scheduleEvent: 'Запланировать событие',
      skip: 'Пропустить',
      skipTooltip: 'Игнорировать этот пробел сейчас',
    },

    confidence: {
      high: 'Высокая уверенность',
      highTooltip: 'Ally уверен, что это реальный пробел в вашем расписании',
      medium: 'Средняя уверенность',
      mediumTooltip: 'Это может быть намеренное свободное время - проверьте перед планированием',
      low: 'Низкая уверенность',
      lowTooltip: 'Это может быть намеренно - Ally менее уверен в этом пробеле',
    },

    dialog: {
      title: 'Заполнить этот пробел',
      eventName: 'Название события',
      eventNamePlaceholder: 'Введите название события',
      description: 'Описание (необязательно)',
      descriptionPlaceholder: 'Добавить описание...',
      calendar: 'Календарь',
      creating: 'Создание...',
      create: 'Создать событие',
    },
  },

  settings: {
    title: 'Настройки',
    profile: 'Профиль',
    preferences: 'Предпочтения',
    notifications: 'Уведомления',
    integrations: 'Интеграции',
    language: 'Язык',
    theme: 'Тема',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    themeSystem: 'Системная',
    appearance: 'Внешний вид',
    appearanceTooltip: 'Выберите предпочитаемую цветовую тему для интерфейса',
    defaultTimezone: 'Часовой пояс по умолчанию',
    timezoneTooltip: 'События будут планироваться в этом часовом поясе, если не указано иное',
    timeFormat: 'Формат времени',
    timeFormatTooltip: 'Формат отображения времени событий в приложении',
    timeFormat12h: '12-часовой (AM/PM)',
    timeFormat24h: '24-часовой',
    realTimeLocation: 'Местоположение в реальном времени',
    realTimeLocationTooltip: 'При включении Ally использует ваше текущее местоположение для предоставления контекста при создании событий (например, предложения ближайших мест)',
    memberSince: 'Участник с',
    languageTooltip: 'Выберите предпочитаемый язык для интерфейса',
    general: 'Общие',
    generalDescription: 'Управляйте своим профилем и предпочтениями.',
  },

  dialogs: {
    eventDetails: {
      title: 'Детали события',
      noDescription: 'Нет описания',
      allDay: 'Весь день',
      location: 'Место',
      attendees: 'Участники',
      calendar: 'Календарь',
      openInGoogle: 'Открыть в Google Календаре',
    },
    dayEvents: {
      title: 'События на {{date}}',
      noEvents: 'Нет событий в этот день',
      totalHours: '{{hours}} часов запланировано',
      available: 'Доступно',
      busy: 'Занято',
      events: 'События',
      eventsTitle: 'События',
      freeTime: 'У вас {{hours}} часов свободного времени в этот день.',
    },
    eventSearch: {
      placeholder: 'Поиск по названию или описанию...',
      noMatches: 'Нет событий, соответствующих вашему поиску.',
      clearSearch: 'Очистить поиск',
      noEvents: 'События для этого календаря в выбранном диапазоне дат не найдены.',
      totalHours: 'Всего часов',
      totalEvents: 'Всего событий',
      filteredHours: 'Отфильтровано часов: {{filtered}}ч (из {{total}}ч)',
      filteredEvents: 'Отфильтровано событий: {{filtered}} (из {{total}})',
      filteredBusy: 'Отфильтровано: {{filtered}}ч (из {{total}}ч)',
      filteredCount: 'События: {{filtered}} из {{total}}',
    },
    calendarEvents: {
      title: 'События {{calendar}}',
      totalHours: '{{hours}} часов всего',
    },
    calendarSettings: {
      title: 'Настройки календаря',
      color: 'Цвет',
      visibility: 'Видимость',
      notifications: 'Уведомления',
    },
    createCalendar: {
      title: 'Создать новый календарь',
      name: 'Название календаря',
      namePlaceholder: 'Введите название календаря',
      description: 'Описание',
      descriptionPlaceholder: 'Добавить описание...',
      color: 'Цвет',
      creating: 'Создание...',
      create: 'Создать календарь',
    },
  },

  onboarding: {
    welcome: 'Добро пожаловать в Ally',
    step1: {
      title: 'Познакомьтесь с вашим ассистентом',
      description: 'Общайтесь с Ally для управления календарём на естественном языке.',
    },
    step2: {
      title: 'Просмотрите аналитику',
      description: 'Получите аналитику о том, как вы проводите время.',
    },
    step3: {
      title: 'Восстановите потерянное время',
      description: 'Найдите и заполните пробелы в вашем расписании.',
    },
    getStarted: 'Начать',
    skip: 'Пропустить тур',
    next: 'Далее',
    previous: 'Назад',
    finish: 'Завершить',
  },

  time: {
    hours: 'часов',
    hoursShort: 'ч',
    minutes: 'минут',
    minutesShort: 'м',
    days: 'дней',
    weeks: 'недель',
    months: 'месяцев',
  },

  days: {
    sunday: 'Воскресенье',
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sun: 'Вс',
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
  },

  errors: {
    generic: 'Что-то пошло не так. Пожалуйста, попробуйте снова.',
    network: 'Ошибка сети. Проверьте подключение.',
    unauthorized: 'Пожалуйста, войдите для продолжения.',
    notFound: 'Запрошенный ресурс не найден.',
    serverError: 'Ошибка сервера. Попробуйте позже.',
    hitSnag: 'Ally столкнулась с проблемой',
    hitSnagDesc: 'Даже лучшие помощники иногда ошибаются. Проблема зафиксирована, давайте вернём вас в работу.',
    viewSystemLogs: 'Просмотр системных логов',
    referenceId: 'ID ссылки',
    persistsContact: 'Если проблема сохраняется, обратитесь в поддержку с ID ссылки выше.',
    criticalError: 'Произошла критическая ошибка. Попробуйте снова или обратитесь в поддержку.',
    viewErrorDetails: 'Показать детали ошибки',
    errorId: 'ID ошибки',
    tryAgain: 'Попробовать снова',
    reloadPage: 'Перезагрузить страницу',
    returnHome: 'На главную',
    retrying: 'Повторная попытка...',
    somethingWentWrong: 'Что-то пошло не так',
    copy: 'Копировать',
    copied: 'Скопировано!',
    copyError: 'Копировать детали ошибки',
  },

  bento: {
    title: 'Приватно. Безопасно. Создано для скорости.',
    subtitle: 'AI-ассистент, созданный вокруг ваших основных потребностей как лидера.',
    features: {
      deepWork: {
        name: 'Защитите глубокую работу',
        description:
          'Ally автоматически защищает ваши важнейшие рабочие блоки от прерываний, интеллектуально перепланируя конфликты.',
        cta: 'Узнать больше',
      },
      flexibleScheduling: {
        name: 'Гибкое планирование',
        description:
          'Приоритеты меняются. Ally позволяет легко корректировать расписание на лету без обычных согласований.',
        cta: 'Смотреть как работает',
      },
      worksEverywhere: {
        name: 'Работает везде',
        description: 'Управляйте календарём из Telegram и WhatsApp. Ally всегда доступна, где бы вы ни были.',
        cta: 'Изучить интеграции',
      },
      chatToDone: {
        name: 'От чата к делу',
        description: 'Самый быстрый путь от мысли до запланированного события. Просто отправьте сообщение.',
        cta: 'Попробовать',
      },
      secure: {
        name: 'Безопасность по умолчанию',
        description:
          'Ваша конфиденциальность фундаментальна. Данные всегда зашифрованы и никогда не используются для обучения моделей.',
        cta: 'Политика конфиденциальности',
      },
    },
  },

  testimonials: {
    badge: 'Ранние отзывы',
    title: 'Что говорят первые пользователи',
    subtitle: 'Узнайте, что думают наши первые пользователи. Ваш отзыв тоже может быть здесь!',
    cta: 'Станьте одним из первых',
    feedbackButton: 'Оставить отзыв',
    featured: {
      name: 'Йосеф Сабаг',
      role: 'Генеральный директор',
      content: 'Использование Ally изменило то, как я отслеживаю своё расписание и получаю более полезные инсайты.',
    },
  },

  faq: {
    title: 'Частые вопросы',
    contactCta: 'Нужно корпоративное развёртывание? Свяжитесь с',
    operationsTeam: 'командой операций',
    questions: {
      interactions: {
        question: 'Почему вы берёте плату за "Взаимодействия"?',
        answer:
          'Мы верим в прозрачный обмен ценностью. Каждое взаимодействие использует продвинутую нейронную логику для аудита или корректировки операций. Измеряя взаимодействия, мы гарантируем, что вы платите только за реально используемый контроль над расписанием.',
      },
      sovereignty: {
        question: 'Что такое "Полный суверенитет"?',
        answer:
          'План Executive за $7/мес даёт неограниченный доступ к нашему нейронному арбитру. Это для руководителей с высокой нагрузкой, которым нужен круглосуточный контроль нескольких сложных календарей с приоритетной нейронной обработкой.',
      },
      audit: {
        question: 'Могу ли я проводить аудит своих данных времени?',
        answer:
          'Да. Наша панель Intelligence предоставляет детальные инсайты по коэффициенту фокуса и затратам на переключение контекста. Мы верим, что вы должны владеть своими данными времени так же, как владеете бизнесом.',
      },
      dataTraining: {
        question: 'Используются ли мои данные для обучения AI?',
        answer:
          'Абсолютно нет. Мы верим, что ваш частный офис должен оставаться частным. Расписание хранится в зашифрованном хранилище и никогда не используется для обучения базовых моделей. Ваш суверенитет это наш приоритет.',
      },
      credits: {
        question: 'Как масштабируются пакеты кредитов?',
        answer:
          'Для бизнеса с сезонной нагрузкой кастомные кредиты ($1 = 100 действий) позволяют масштабировать контроль без изменения подписки. Они никогда не сгорают и служат операционным резервом.',
      },
    },
  },

  useCases: {
    intelligentScheduling: {
      title: 'Умное планирование',
      description: 'Находит идеальное время для встреч, легко навигируя сложные календари и часовые пояса.',
      userMessage: 'Найди 30 минут для меня, Сары и Алекса.',
      allyResponse: 'Готово. Вторник в 14:30.',
      confirmation: 'Все календари обновлены.',
    },
    focusProtection: {
      title: 'Защита времени фокуса',
      description:
        'Автоматически защищает сессии глубокой работы от прерываний путём интеллектуального перепланирования конфликтов.',
      userMessage: 'Защити моё утро для стратегии Q4.',
      allyResponse: 'Календарь заблокирован с 9:00 до 12:00.',
      focusModeActive: 'Режим фокуса активен.',
    },
    travelAgent: {
      title: 'Проактивный travel-агент',
      description:
        'Отслеживает планы поездок, автоматически адаптируясь к задержкам и информируя всех заинтересованных.',
      delayAlert: 'Рейс в SFO задержан на 2 часа.',
      allyResponse: 'Решено. Трансфер и отель обновлены.',
    },
    voiceToAction: {
      title: 'Голос в действие',
      description: 'Фиксируйте мысли и команды на ходу. Ally транскрибирует, понимает и выполняет задачи мгновенно.',
      userMessage: '"Напомни позвонить инвесторам в 16:00"',
      allyResponse: "Напоминание установлено: 'Позвонить инвесторам' в 16:00.",
    },
  },

  billing: {
    title: 'Оплата и подписка',
    subtitle: 'Управление подпиской и платёжными данными',
    manageBilling: 'Управление оплатой',
    paymentSuccess: 'Оплата прошла успешно!',
    subscriptionActivated: 'Ваша подписка активирована.',
    freePlan: 'Бесплатный план',
    billedAnnually: 'Годовая оплата',
    billedMonthly: 'Ежемесячная оплата',
    status: {
      trial: 'Пробный период',
      active: 'Активна',
      pastDue: 'Просрочена',
      canceled: 'Отменена',
      free: 'Бесплатно',
    },
    trial: {
      daysLeft: 'Осталось {{count}} дней пробного периода',
      fullAccess: 'Пробный период включает полный доступ ко всем функциям. Оплата не взимается до окончания.',
      expired: 'Пробный период истёк',
      expiredDescription: 'Ваш пробный период истёк – обновите сейчас, чтобы сохранить доступ.',
      activeDescription: 'Ваш бесплатный пробный период заканчивается через {{count}} день. Не потеряйте доступ к вашему ИИ-ассистенту.',
      remaining: 'осталось',
      getDeal: 'Получить предложение',
    },
    moneyBack: {
      title: 'Гарантия возврата денег 30 дней активна',
      description: 'Не удовлетворены? Получите полный возврат без вопросов.',
    },
    cancelNotice: {
      title: 'Ваша подписка будет отменена в конце расчётного периода',
      accessUntil: 'Доступ до: {{date}}',
    },
    usage: {
      title: 'Использование за период',
      aiInteractions: 'AI взаимодействия',
      unlimited: 'Без ограничений',
      remaining: 'Осталось {{count}}',
      creditBalance: 'Баланс кредитов',
      credits: '{{count}} кредитов',
    },
    transactions: {
      title: 'История транзакций',
    },
    plans: {
      title: 'Доступные планы',
      popular: 'Популярный',
      perMonth: '/мес',
      unlimitedInteractions: 'Неограниченные взаимодействия',
      interactionsPerMonth: '{{count}} взаимодействий/мес',
      upgrade: 'Улучшить',
      downgrade: 'Понизить',
      currentPlan: 'Текущий план',
    },
    actions: {
      title: 'Действия с подпиской',
      cancelSubscription: 'Отменить подписку',
      cancelDesc: 'Доступ сохранится до конца расчётного периода',
      cancel: 'Отменить',
      requestRefund: 'Запросить полный возврат',
      refundDesc: 'Гарантия возврата 30 дней - без вопросов',
    },
    confirm: {
      cancelTitle: 'Отменить подписку',
      cancelDescription:
        'Вы уверены, что хотите отменить подписку? Вы сохраните доступ ко всем функциям до конца текущего расчётного периода.',
      cancelTrialDescription:
        'Вы уверены, что хотите отменить пробный период? Вы немедленно потеряете доступ к премиум-функциям.',
      cancelButton: 'Да, отменить',
      keepButton: 'Сохранить подписку',
      refundTitle: 'Запросить возврат',
      refundDescription:
        'Вы уверены, что хотите запросить полный возврат? Ваша подписка будет немедленно отменена, и доступ будет отозван.',
      refundButton: 'Запросить возврат',
      nevermindButton: 'Отмена',
    },

    // Toast messages
    toast: {
      // General settings
      timezoneUpdated: 'Часовой пояс обновлен',
      timezoneUpdateFailed: 'Не удалось обновить часовой пояс',
      timeFormatUpdated: 'Формат времени обновлен',
      timeFormatUpdateFailed: 'Не удалось обновить формат времени',
      realTimeLocationEnabled: 'Местоположение в реальном времени включено',
      realTimeLocationDisabled: 'Местоположение в реальном времени отключено',
      locationEnableFailed: 'Не удалось включить местоположение',
      locationDisableFailed: 'Не удалось отключить местоположение',
      locationAccessDenied: 'Доступ к местоположению отклонен',
      locationAccessDeniedDescription: 'Пожалуйста, включите доступ к местоположению в настройках браузера.',

      // Integrations
      crossPlatformSyncEnabled: 'Кроссплатформенная синхронизация включена',
      crossPlatformSyncDisabled: 'Кроссплатформенная синхронизация отключена',
      integrationUpdateFailed: 'Не удалось обновить настройки',

      // Assistant settings
      voiceInputError: 'Ошибка голосового ввода',
      customInstructionsSaved: 'Пользовательские инструкции сохранены',
      instructionsSaveFailed: 'Не удалось сохранить инструкции',
      contextualSchedulingEnabled: 'Контекстное планирование включено',
      contextualSchedulingDisabled: 'Контекстное планирование отключено',
      memoryManagementUpdateFailed: 'Не удалось обновить настройки',

      // Chat
      allyResponded: 'Ally ответила',
      memoryUpdated: 'Память обновлена',
      regeneratingResponse: 'Повторная генерация ответа...',

      // Gaps
      gapsSettingsSaved: 'Настройки успешно сохранены',
      gapsSettingsSaveFailed: 'Не удалось сохранить настройки',

      // Conversations
      titleUpdated: 'Заголовок успешно обновлен',
      titleUpdateFailed: 'Не удалось обновить заголовок',
      shareLinkCopied: 'Ссылка на общий доступ скопирована в буфер обмена',
      shareLinkCreateFailed: 'Не удалось создать ссылку на общий доступ',
      conversationPinned: 'Беседа успешно закреплена',
      conversationUnpinned: 'Беседа успешно откреплена',
      conversationPinFailed: 'Не удалось изменить статус закрепления беседы',

      // Archived conversations
      conversationRestored: 'Беседа успешно восстановлена',
      conversationRestoreFailed: 'Не удалось восстановить беседу',
      allConversationsRestored: 'Все заархивированные беседы успешно восстановлены',
      conversationsRestoreFailed: 'Не удалось восстановить беседы',

      // Settings modal
      googleCalendarDisconnected: 'Google Calendar отключен',
      googleCalendarDisconnectFailed: 'Не удалось отключить Google Calendar',
      conversationsDeleted: 'Беседы удалены',
      conversationsDeleteFailed: 'Не удалось удалить беседы',
      memoryCleared: 'Память очищена',
      memoryClearFailed: 'Не удалось сбросить память',
      accountDeleted: 'Аккаунт успешно удален',
      accountDeleteFailed: 'Не удалось удалить аккаунт',

      // Quick event
      microphoneAccessDenied: 'Доступ к микрофону отклонен',
      eventCreated: 'Событие успешно создано',

      // Notifications
      reminderPreferencesSaved: 'Настройки напоминаний сохранены',
      reminderPreferencesSaveFailed: 'Не удалось сохранить настройки напоминаний',
      soundNotificationsEnabled: 'Звуковые уведомления включены',
      soundNotificationsDisabled: 'Звуковые уведомления отключены',
      browserNotificationPermissionDenied: 'Разрешение на уведомления браузера отклонено',
      browserNotificationsEnabled: 'Уведомления браузера включены',
      notificationPreferencesSaved: 'Настройки уведомлений сохранены',
      notificationPreferencesSaveFailed: 'Не удалось сохранить настройки уведомлений',

      // Daily briefing
      dailyBriefingPreferencesSaved: 'Настройки ежедневного брифинга сохранены',
      dailyBriefingPreferencesSaveFailed: 'Не удалось сохранить настройки ежедневного брифинга',

      // Voice settings
      voiceResponseEnabled: 'Голосовые ответы включены',
      voiceResponseDisabled: 'Голосовые ответы отключены',
      voicePreferenceUpdateFailed: 'Не удалось обновить настройки голоса',
      voiceChanged: 'Голос изменен на {{voice}}',
      voiceUpdateFailed: 'Не удалось обновить голос',
      playbackSpeedChanged: 'Скорость воспроизведения изменена на {{speed}}x',
      playbackSpeedUpdateFailed: 'Не удалось обновить скорость воспроизведения',
      voicePreviewFailed: 'Не удалось воспроизвести предварительный просмотр голоса',

      // Messages
      messageCopied: 'Сообщение скопировано в буфер обмена',
      messageCopyFailed: 'Не удалось скопировать сообщение',

      // Audio playback
      audioStopped: 'Аудио остановлено',
      audioPlaying: 'Воспроизведение аудио...',
      audioPlayFailed: 'Не удалось воспроизвести аудио',

      // Date range picker
      dateRangeApplied: 'Диапазон дат применен',
      dateRangeSelectBoth: 'Пожалуйста, выберите дату начала и окончания',

      // Calendar creation
      calendarNameRequired: 'Пожалуйста, введите название календаря',
      calendarCreated: 'Календарь успешно создан!',
      calendarCreateFailed: 'Не удалось создать календарь',
      calendarCreateFailedGeneric: 'Не удалось создать календарь. Пожалуйста, попробуйте еще раз.',

      // Waiting list
      waitingListWelcome: 'Добро пожаловать в список ожидания!',
      waitingListError: 'Ошибка',

      // Admin
      userImpersonationFailed: 'Не удалось войти под видом пользователя',
      userSessionsRevoked: 'Сессии пользователя отозваны',
      userSessionsRevokeFailed: 'Не удалось отозвать сессии',

      // Broadcast
      broadcastTitleRequired: 'Требуются заголовок и сообщение',
      broadcastSent: 'Рассылка отправлена {{count}} пользователям',
      broadcastSendFailed: 'Не удалось отправить рассылку',

      // Billing
      alreadyOnFreePlan: 'Вы уже на бесплатном плане',
      billingPortalOpenFailed: 'Не удалось открыть портал оплаты',
      checkoutProcessFailed: 'Не удалось обработать оплату. Пожалуйста, попробуйте еще раз.',
      redirectingToCheckout: 'Перенаправление на оплату для настройки биллинга...',

      // Voice preview
      voicePreviewError: 'Не удалось воспроизвести предварительный просмотр голоса',

      // Chat input
      maxImagesAllowed: 'Максимум {{count}} изображений разрешено',
      imageProcessingFailed: 'Не удалось обработать изображения',
      unsupportedImageType: 'Неподдерживаемый тип изображения: {{type}}',
      imageTooLarge: 'Изображение слишком большое (макс. {{size}}MB)',
      pastedImagesProcessingFailed: 'Не удалось обработать вставленные изображения',
    },

    // UI Text
    ui: {
      // Common UI elements
      stop: 'Стоп',
      voice: 'Голос',
      time: 'Время',
      organizer: 'Организатор',
      created: 'Создано',
      transactionId: 'ID транзакции',
      noInvoiceAvailable: 'Счет недоступен',
      noTransactionsYet: 'Транзакций пока нет',
      date: 'Дата',
      description: 'Описание',
      amount: 'Сумма',
      status: 'Статус',
      invoice: 'Счет',
      totalGaps: 'Всего пробелов',
      highConfidence: 'Высокая уверенность',
      potentialHours: 'Потенциальные часы',
      avgGapSize: 'Средний размер пробела',
      analysisPeriod: 'Период анализа',
      chat: 'Чат',
      gaps: 'Пробелы',
      analytics: 'Аналитика',
      settings: 'Настройки',
      after: 'После:',
      before: 'До:',
      fillGap: 'Заполнить пробел событием',
      eventTitle: 'Название события *',
      skipThisGap: 'Пропустить этот пробел',
      reason: 'Причина (необязательно)',
      integrations: 'Интеграции',
      telegram: 'Telegram',
      whatsapp: 'WhatsApp',
      slack: 'Slack',
      googleCalendar: 'Google Calendar',
      failedToLoadCalendarData: 'Не удалось загрузить данные календаря.',
      noActiveCalendarSourcesFound: 'Активные источники календаря не найдены.',
      connectWhatsApp: 'Подключить WhatsApp',
      neuralLinks: 'Нейронные связи',
      executiveGradeAI: 'AI-ассистент исполнительного уровня, разработанный для владельцев бизнеса для защиты их глубокого рабочего времени. От бесплатного исследовательского доступа к неограниченной исполнительной власти. Построен на протоколе Ally Neural.',
      systemOnline: 'Все системы работают',
      systemOffline: 'Система недоступна',
      systemChecking: 'Проверка статуса...',
      chatOnTelegram: 'Чат с Ally в Telegram',
      checkingServices: 'Проверка сервисов...',
      serverUnreachable: 'Сервер недоступен',
      serverOnline: 'Сервер онлайн',
      uptime: 'Время работы',
      websockets: 'WebSockets',
      connections: 'подключений',
      privacyPolicy: 'Политика конфиденциальности',
      termsOfService: 'Условия использования',
      product: 'Продукт',
      pricing: 'Цены',
      executivePower: 'Исполнительная власть',
      company: 'Компания',
      aboutUs: 'О нас',
      careers: 'Карьера',
      resources: 'Ресурсы',
      blog: 'Журнал изменений',
      changeLog: 'Журнал изменений',
    },

    // Integrations
    integrations: {
      title: 'Интеграции',
      description: 'Подключайте и управляйте своим исполнительным рабочим пространством.',
      telegram: {
        title: 'Telegram',
        description: 'Взаимодействуйте с Ally напрямую через вашего Telegram-бота.',
        settings: 'Настройки',
      },
      whatsapp: {
        title: 'WhatsApp',
        description: 'Синхронизируйте Ally с WhatsApp для безопасной ретрансляции сообщений.',
        connect: 'Подключить',
      },
      slack: {
        title: 'Slack',
        description: 'Добавьте Ally в свое Slack рабочее пространство для управления командным календарем.',
      },
      googleCalendar: {
        title: 'Google Calendar',
        failedToLoad: 'Не удалось загрузить данные календаря.',
        noSources: 'Активные источники календаря не найдены.',
      },
      status: {
        connected: 'Подключено',
        disconnected: 'Отключено',
      },
      connectWhatsApp: 'Подключить WhatsApp',
      refresh: 'Обновить',
    },

    // Admin
    admin: {
      grantCredits: {
        title: 'Предоставить кредиты',
        description: 'Добавить кредиты к аккаунту {{user}}',
        creditAmount: 'Сумма кредитов',
        creditPlaceholder: 'Введите количество кредитов',
        currentBalance: 'Текущий баланс: {{count}} кредитов',
        reasonLabel: 'Причина (необязательно)',
        reasonPlaceholder: 'например, Компенсация за проблему сервиса, рекламный бонус...',
        auditNote: 'Это будет записано для аудита',
        cancel: 'Отмена',
        granting: 'Предоставление...',
        grantCredits: 'Предоставить кредиты',
        invalidAmount: 'Пожалуйста, введите корректную сумму кредитов',
        success: '{{count}} кредитов успешно предоставлено {{email}}',
        failed: 'Не удалось предоставить кредиты: {{error}}',
      },
    },
  },

} as const
