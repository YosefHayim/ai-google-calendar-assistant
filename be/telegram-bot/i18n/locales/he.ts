import type { LocaleTranslations } from "../types"

export const he: LocaleTranslations = {
  commands: {
    start: {
      header: "ברוכים הבאים ל-Ally",
      welcomeText: "אני המזכירה האישית שלך ל-Google Calendar. ספר לי מה אתה צריך בשפה פשוטה — אני אטפל בכל השאר.",
      sections: [
        {
          emoji: "🚀",
          title: "להתחיל",
          items: [
            { bullet: "dot", text: "פשוט שלח לי הודעה" },
            { bullet: "dot", text: "או הקלד /help כדי לראות מה אני יכולה לעשות" },
          ],
        },
        {
          emoji: "📅",
          title: "נסה להגיד",
          items: [
            { bullet: "none", text: "'מה יש לי היום?'" },
            { bullet: "none", text: "'קבע 2 שעות לעבודה מעמיקה מחר'" },
          ],
        },
      ],
      footer: "בוא ננצל את הזמן שלך ✨",
    },

    help: {
      header: "איך Ally עוזרת",
      description: "המזכירה האישית שלך לשליטה ביומן.",
      sections: [
        {
          emoji: "📅",
          title: "צפייה בלו״ז",
          items: [
            { bullet: "dot", text: "/today — לו״ז להיום" },
            { bullet: "dot", text: "/tomorrow — סדר יום למחר" },
            { bullet: "dot", text: "/week — סקירה שבועית" },
            { bullet: "dot", text: "/month — סקירה חודשית" },
            { bullet: "dot", text: "/free — מציאת זמנים פנויים" },
            { bullet: "dot", text: "/busy — צפייה בהתחייבויות" },
          ],
        },
        {
          emoji: "⚡",
          title: "ניהול אירועים",
          items: [
            { bullet: "dot", text: "/create — קביעת אירוע" },
            { bullet: "dot", text: "/update — שינוי או עריכה" },
            { bullet: "dot", text: "/delete — ביטול אירוע" },
            { bullet: "dot", text: "/search — חיפוש ביומן" },
          ],
        },
        {
          emoji: "📊",
          title: "תובנות זמן",
          items: [
            { bullet: "dot", text: "/analytics — הבנת הזמן שלך" },
            { bullet: "dot", text: "/calendars — היומנים שלך" },
          ],
        },
        {
          emoji: "🛠️",
          title: "הגדרות",
          items: [
            { bullet: "dot", text: "/status — בדיקת חיבור" },
            { bullet: "dot", text: "/settings — הגדרות Ally" },
            { bullet: "dot", text: "/language — שינוי שפה" },
            { bullet: "dot", text: "/feedback — שליחת משוב" },
            { bullet: "dot", text: "/exit — סיום שיחה" },
          ],
        },
      ],
      naturalLanguageTip: "💬 או פשוט שלח לי הודעה!",
      footerTip: "'כמה זמן עבודה מעמיקה היה לי השבוע לעומת שבוע שעבר?'",
    },

    usage: {
      header: "ככה Ally עוזרת:",
      sections: [
        {
          emoji: "📅",
          title: "תזמון והגנה",
          items: [
            { bullet: "dot", text: "'קבע 2 שעות לעבודה מעמיקה מחר בבוקר'" },
            { bullet: "dot", text: "'קבע שיחה עם שרה ב-3 אחה״צ'" },
          ],
        },
        {
          emoji: "🔎",
          title: "שאילתות זמן",
          items: [
            { bullet: "dot", text: "'מה יש לי היום?'" },
            { bullet: "dot", text: "'מצא לי זמן פנוי השבוע'" },
          ],
        },
        {
          emoji: "⚙️",
          title: "התאמה אישית",
          items: [{ bullet: "dot", text: "הקלד /settings להתאמה אישית של Ally" }],
        },
      ],
    },

    exit: {
      header: "להתראות",
      text: "השיחה נמחקה. אני כאן כשתצטרך — פשוט שלח הודעה כדי להמשיך מאיפה שהפסקת.",
      footer: "לך לעשות דברים ✨",
    },

    today: {
      header: "הלו״ז להיום",
      text: "מביא את סדר היום שלך להיום...",
      footerTip: "אפשר גם לשאול 'מה יש לי היום?' בכל עת.",
    },

    tomorrow: {
      header: "סדר היום למחר",
      text: "בודק מה מתוכנן למחר...",
      footerTip: "תכנן את היום בערב הקודם.",
    },

    week: {
      header: "סקירה שבועית",
      text: "מביא סקירה ל-7 ימים...",
      footerTip: "שבוע מתוכנן היטב = יותר זמן לעבודה מעמיקה.",
    },

    month: {
      header: "סקירה חודשית",
      text: "מביא את היומן לחודש הזה...",
      footerTip: "השתמש ב-/analytics לתובנות ומגמות.",
    },

    free: {
      header: "מחפש זמנים פנויים",
      text: "סורק את הלו״ז שלך לזמינות...",
      alsoAskText: "אפשר גם לשאול:",
      suggestions: ["'מתי אני פנוי השבוע?'", "'מצא לי 2 שעות לעבודה מעמיקה'", "'מה הזמן הפנוי הבא שלי?'"],
    },

    busy: {
      header: "ההתחייבויות שלך",
      text: "בודק מתי אתה תפוס...",
      footerTip: "השתמש ב-/free למציאת זמנים פנויים.",
    },

    quick: {
      header: "הוספה מהירה",
      text: "פשוט ספר לי מה לתזמן:",
      examples: ["'שיחה עם שרה ב-3'", "'ארוחת צהריים מחר בצהריים'", "'חסום את יום שישי אחה״צ לריכוז'"],
      footer: "אני אטפל בשאר ✨",
    },

    create: {
      header: "קביעת אירוע",
      text: "פשוט תאר מה אתה צריך — אני מבינה שפה טבעית:",
      sections: [
        {
          emoji: "📅",
          title: "אירועים ופגישות",
          items: [
            { bullet: "dot", text: "'שיחה עם שרה מחר ב-2'" },
            { bullet: "dot", text: "'סנכרון צוות כל יום שני ב-9'" },
            { bullet: "dot", text: "'ארוחת צהריים עם משקיע ביום שישי'" },
          ],
        },
        {
          emoji: "🧠",
          title: "ריכוז ועבודה מעמיקה",
          items: [
            { bullet: "dot", text: "'חסום 3 שעות לעבודה מעמיקה מחר בבוקר'" },
            { bullet: "dot", text: "'שמור את יום שישי אחה״צ לאסטרטגיה'" },
          ],
        },
        {
          emoji: "⏱️",
          title: "עם משך",
          items: [
            { bullet: "dot", text: "'סדנה של שעתיים ביום רביעי ב-10'" },
            { bullet: "dot", text: "'צ׳ק-אין קצר של 15 דקות ב-4'" },
          ],
        },
        {
          emoji: "🎯",
          title: "יומן ספציפי",
          items: [{ bullet: "dot", text: "'הוסף לעבודה: שיחה עם לקוח ביום שישי ב-2'" }],
        },
      ],
      footerTip: "תאר את האירוע ואני אטפל בשאר.",
    },

    update: {
      header: "שינוי או עריכה",
      text: "שנה כל אירוע ביומן שלך:",
      sections: [
        {
          emoji: "🕐",
          title: "שינוי מועד",
          items: [
            { bullet: "dot", text: "'הזז את הפגישה של 2 ל-4'" },
            { bullet: "dot", text: "'דחה את הרופא לשבוע הבא'" },
            { bullet: "dot", text: "'הזז את ארוחת הצהריים של שישי ל-1'" },
          ],
        },
        {
          emoji: "📝",
          title: "עריכת פרטים",
          items: [
            { bullet: "dot", text: "'שנה את שם פגישת הצוות ל-Sprint Review'" },
            { bullet: "dot", text: "'הוסף לינק זום לשיחה של מחר'" },
            { bullet: "dot", text: "'עדכן את תיאור פגישת הפרויקט'" },
          ],
        },
        {
          emoji: "⏱️",
          title: "שינוי משך",
          items: [
            { bullet: "dot", text: "'הפוך את הסטנדאפ ל-30 דקות במקום 15'" },
            { bullet: "dot", text: "'האר את הסדנה של מחר בשעה'" },
          ],
        },
      ],
      footerTip: "פשוט ספר לי מה לשנות.",
    },

    delete: {
      header: "ביטול אירוע",
      text: "הסר אירועים מהיומן שלך:",
      sections: [
        {
          emoji: "❌",
          title: "ביטול לפי שם",
          items: [
            { bullet: "dot", text: "'בטל את הפגישה של 3'" },
            { bullet: "dot", text: "'הסר ארוחת צהריים עם יוחנן מחר'" },
            { bullet: "dot", text: "'מחק את התור לרופא שיניים'" },
          ],
        },
        {
          emoji: "📅",
          title: "ניקוי מרובה",
          items: [
            { bullet: "dot", text: "'נקה את יום שישי אחה״צ'" },
            { bullet: "dot", text: "'הסר את כל הפגישות מחר'" },
          ],
        },
        {
          emoji: "🔄",
          title: "אירועים חוזרים",
          items: [
            { bullet: "dot", text: "'דלג על הסטנדאפ השבוע'" },
            { bullet: "dot", text: "'בטל את כל פגישות הצוות העתידיות'" },
          ],
        },
      ],
      footerWarning: "אני אאשר לפני מחיקה ⚠️",
    },

    cancel: {
      header: "ביטול או שינוי",
      text: "צריך לעשות שינויים? פשוט ספר לי:",
      examples: ["'בטל את הפגישה של 3'", "'דחה את השיחה של מחר לשבוע הבא'", "'נקה את יום שישי אחה״צ שלי'"],
      footer: "אני אטפל בעדכונים.",
    },

    search: {
      header: "חיפוש ביומן",
      text: "מצא כל אירוע ביומן שלך:",
      sections: [
        {
          emoji: "📝",
          title: "חיפוש לפי מילת מפתח",
          items: [
            { bullet: "dot", text: "'מצא פגישות עם יוחנן'" },
            { bullet: "dot", text: "'חפש רופא שיניים'" },
            { bullet: "dot", text: "'הראה את כל הסטנדאפים'" },
            { bullet: "dot", text: "'מצא אירועים על פרויקט אלפא'" },
          ],
        },
        {
          emoji: "🗓️",
          title: "סינון לפי תאריך",
          items: [
            { bullet: "dot", text: "'מצא פגישות בשבוע הבא'" },
            { bullet: "dot", text: "'חפש שיחות בדצמבר'" },
          ],
        },
      ],
      footerTip: "פשוט תאר מה אתה מחפש.",
    },

    remind: {
      header: "הגדרת תזכורת",
      text: "לא תפספס דברים חשובים. נסה:",
      examples: ["'הזכר לי להתקשר ליוחנן ב-5'", "'קבע תזכורת למחר בבוקר'", "'הזכר לי 30 דקות לפני הפגישה הבאה'"],
      footer: "אני דואגת לך 💪",
    },

    analytics: {
      header: "תובנות זמן",
      text: "הבן איך אתה מבלה את הזמן שלך:",
      sections: [
        {
          emoji: "📈",
          title: "תקופת זמן",
          items: [
            { bullet: "dot", text: "'תובנות להיום'" },
            { bullet: "dot", text: "'תובנות לשבוע הזה'" },
            { bullet: "dot", text: "'תובנות לחודש הזה'" },
            { bullet: "dot", text: "'פירוט ל-30 יום אחרונים'" },
          ],
        },
        {
          emoji: "🔄",
          title: "השוואת תקופות",
          items: [
            { bullet: "dot", text: "'השווה שבוע זה לשבוע שעבר'" },
            { bullet: "dot", text: "'איך החודש הזה בהשוואה לקודם?'" },
          ],
        },
        {
          emoji: "🧠",
          title: "עבודה מעמיקה וריכוז",
          items: [
            { bullet: "dot", text: "'כמה עבודה מעמיקה היתה לי השבוע?'" },
            { bullet: "dot", text: "'זמן בפגישות לעומת זמן ריכוז'" },
            { bullet: "dot", text: "'מגמות הפרודוקטיביות שלי החודש'" },
          ],
        },
      ],
      footerTip: "אני אראה לך לאן הזמן שלך הולך.",
    },

    calendars: {
      header: "היומנים שלך",
      text: "מביא את היומנים המחוברים שלך...",
      footerTip: "אפשר לתזמן אירועים ליומנים ספציפיים לפי שם.",
    },

    status: {
      header: "סטטוס חיבור",
      text: "בודק את החיבור ל-Google Calendar...",
      checkingItems: ["Google Calendar: מאמת..."],
      footerTip: "בעיות? נסה /settings להתחברות מחדש.",
    },

    settings: {
      header: "הגדרות Ally",
      connectedAsText: "מחובר כ:",
      sections: [
        {
          emoji: "🔧",
          title: "אפשרויות",
          items: [
            { bullet: "dot", text: "<b>שינוי אימייל</b> — עדכן את האימייל המקושר", emphasis: true },
            { bullet: "dot", text: "<b>חיבור מחדש ל-Google</b> — אשר מחדש גישה ליומן", emphasis: true },
          ],
        },
      ],
      footerText: "בחר אפשרות למטה:",
      buttons: {
        changeEmail: "📧 שינוי אימייל",
        reconnectGoogle: "🔗 חיבור מחדש ל-Google Calendar",
      },
    },

    changeEmail: {
      notAuthenticatedError: "עליך להתחבר קודם. אנא שלח לי את כתובת האימייל שלך.",
      currentEmailText: "האימייל הנוכחי שלך:",
      enterNewEmailPrompt: "אנא הזן את כתובת האימייל החדשה:",
    },

    feedback: {
      header: "שתף משוב",
      text: "המשוב שלך מעצב את התפתחות Ally. אפשר:",
      options: ["לספר מה עובד טוב 🎉", "לדווח על בעיות שנתקלת בהן", "להציע תכונות שתרצה לראות"],
      instructionText: "פשוט כתוב את המשוב שלך — הצוות יראה אותו.",
      footer: "תודה שאתה עוזר לנו לבנות משהו נהדר ✨",
    },

    language: {
      header: "הגדרות שפה",
      currentLanguageText: "שפה נוכחית:",
      selectPrompt: "בחר את השפה המועדפת:",
      changedText: "השפה שונתה ל",
      languages: {
        en: "English (אנגלית)",
        he: "עברית",
      },
    },
  },

  auth: {
    welcomePrompt: "ברוכים הבאים! כדי להתחיל, אנא הזן את כתובת האימייל שלך לאימות:",
    enterOtpPrompt:
      "קוד אימות נשלח ל-{{email}}.\n\nאנא הזן את הקוד בן 6 הספרות מהאימייל (תקף ל-10 דקות).\n\nאם הזנת אימייל שגוי, פשוט הקלד את הנכון.",
    otpExpired: "קוד האימות פג תוקף. אנא הזן את האימייל שוב:",
    otpInvalidError: "קוד אימות לא תקין. אנא נסה שוב או הזן כתובת אימייל אחרת.",
    otpInvalidWithNewEmail: "שגיאה: {{error}}",
    emailVerifiedSuccess: "האימייל אומת ונשמר בהצלחה! כעת אפשר להשתמש בבוט.",
    dbSaveError: "שגיאה בשמירת האימייל. אנא נסה שוב.",
    enterOtpOrNewEmail: "אנא הזן את קוד האימות בן 6 הספרות מהאימייל, או הזן כתובת אימייל אחרת:",
    otpSentToNewEmail: "קוד אימות נשלח ל-{{email}}.\n\nאנא הזן את הקוד בן 6 הספרות מהאימייל (תקף ל-10 דקות):",
    otpSendFailed: "שליחת קוד האימות נכשלה: {{error}}\n\nאנא נסה עם כתובת אימייל אחרת.",
  },

  errors: {
    processingError: "שגיאה בעיבוד הבקשה שלך.",
    noOutputFromAgent: "לא התקבל פלט מסוכן ה-AI.",
    eventCreationError: "שגיאה ביצירת האירוע. אנא נסה שוב.",
    confirmationError: "שגיאה באישור. אנא נסה שוב.",
    pendingEventPrompt: "יש לך יצירת אירוע ממתינה. אנא השב 'כן' ליצירה למרות התנגשויות, או 'לא' לביטול.",
    processingPreviousRequest: "רגע, אני עדיין עובדת על הבקשה הקודמת שלך...",
  },

  common: {
    confirm: "אישור",
    cancel: "ביטול",
    yes: "כן",
    no: "לא",
    eventCreationCancelled: "יצירת האירוע בוטלה.",
    typeExitToStop: "הקלד /exit לסיום.",
  },

  botMenu: {
    today: "לו״ז להיום",
    tomorrow: "סדר יום למחר",
    week: "סקירה שבועית",
    month: "סקירה חודשית",
    free: "מציאת זמנים פנויים",
    busy: "צפייה בהתחייבויות",
    create: "קביעת אירוע",
    update: "שינוי או עריכה",
    delete: "ביטול אירוע",
    search: "חיפוש ביומן",
    analytics: "תובנות זמן",
    calendars: "היומנים שלך",
    status: "בדיקת חיבור",
    settings: "הגדרות Ally",
    help: "איך Ally עוזרת",
    feedback: "שליחת משוב",
    exit: "סיום שיחה",
    language: "שינוי שפה",
  },
}
