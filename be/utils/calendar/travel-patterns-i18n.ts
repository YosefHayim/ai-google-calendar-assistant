import type { SupportedEventLanguage } from "@/types";

export type TravelPatternSet = {
  arrival: RegExp[];
  departure: RegExp[];
  workKeywords: string[];
};

export const TRAVEL_PATTERNS_BY_LANGUAGE: Record<
  SupportedEventLanguage,
  TravelPatternSet
> = {
  en: {
    arrival: [
      /^drive to (.+)$/iu,
      /^travel to (.+)$/iu,
      /^commute to (.+)$/iu,
      /^arrive at (.+)$/iu,
      /^heading to (.+)$/iu,
      /^go to (.+)$/iu,
      /^trip to (.+)$/iu,
      /^flight to (.+)$/iu,
      /^train to (.+)$/iu,
      /^bus to (.+)$/iu,
      /^uber to (.+)$/iu,
      /^taxi to (.+)$/iu,
      /^ride to (.+)$/iu,
    ],
    departure: [
      /^drive home$/iu,
      /^leave (.+)$/iu,
      /^depart (.+)$/iu,
      /^heading home$/iu,
      /^go home$/iu,
      /^return home$/iu,
      /^drive from (.+)$/iu,
      /^leaving (.+)$/iu,
      /^departure from (.+)$/iu,
    ],
    workKeywords: [
      "meeting",
      "standup",
      "sync",
      "call",
      "review",
      "sprint",
      "planning",
      "retro",
      "1:1",
      "interview",
      "workshop",
      "presentation",
      "demo",
    ],
  },

  de: {
    arrival: [
      /^fahrt nach (.+)$/iu,
      /^fahren nach (.+)$/iu,
      /^zur (.+) fahren$/iu,
      /^pendeln zur (.+)$/iu,
      /^ankunft (.+)$/iu,
      /^reise nach (.+)$/iu,
      /^flug nach (.+)$/iu,
      /^zug nach (.+)$/iu,
      /^bus nach (.+)$/iu,
      /^taxi nach (.+)$/iu,
      /^zur arbeit$/iu,
      /^ins büro$/iu,
      /^in die firma$/iu,
      /^arbeitsweg$/iu,
    ],
    departure: [
      /^nach hause fahren$/iu,
      /^heimfahrt$/iu,
      /^abfahrt von (.+)$/iu,
      /^verlassen (.+)$/iu,
      /^rückkehr$/iu,
      /^nach hause$/iu,
      /^heimweg$/iu,
      /^feierabend$/iu,
    ],
    workKeywords: [
      "besprechung",
      "meeting",
      "standup",
      "anruf",
      "review",
      "sprint",
      "planung",
      "retro",
      "termin",
      "konferenz",
      "workshop",
      "präsentation",
    ],
  },

  fr: {
    arrival: [
      /^aller [àa] (.+)$/iu,
      /^trajet vers (.+)$/iu,
      /^départ pour (.+)$/iu,
      /^voyage [àa] (.+)$/iu,
      /^vol vers (.+)$/iu,
      /^train vers (.+)$/iu,
      /^bus vers (.+)$/iu,
      /^taxi vers (.+)$/iu,
      /^aller au travail$/iu,
      /^aller au bureau$/iu,
      /^trajet domicile-travail$/iu,
      /^navette$/iu,
      /^faire la navette$/iu,
    ],
    departure: [
      /^retour maison$/iu,
      /^rentrer$/iu,
      /^quitter (.+)$/iu,
      /^partir de (.+)$/iu,
      /^retour [àa] la maison$/iu,
      /^fin de journée$/iu,
      /^départ$/iu,
    ],
    workKeywords: [
      "réunion",
      "meeting",
      "appel",
      "revue",
      "sprint",
      "planification",
      "rétro",
      "rendez-vous",
      "conférence",
      "atelier",
      "présentation",
    ],
  },

  he: {
    arrival: [
      /^נסיעה ל(.+)$/u,
      /^בדרך ל(.+)$/u,
      /^הגעה ל(.+)$/u,
      /^טיסה ל(.+)$/u,
      /^רכבת ל(.+)$/u,
      /^אוטובוס ל(.+)$/u,
      /^מונית ל(.+)$/u,
      /^לעבודה$/u,
      /^למשרד$/u,
      /^נסיעה לעבודה$/u,
      /^הגעה לעבודה$/u,
      /^יציאה ל(.+)$/u,
    ],
    departure: [
      /^נסיעה הביתה$/u,
      /^חזרה הביתה$/u,
      /^יציאה מ(.+)$/u,
      /^עזיבת (.+)$/u,
      /^עזיבה$/u,
      /^סוף יום$/u,
      /^הביתה$/u,
      /^חזרה$/u,
    ],
    workKeywords: [
      "פגישה",
      "ישיבה",
      "שיחה",
      "סקירה",
      "תכנון",
      "רטרו",
      "מיטינג",
      "כנס",
      "הרצאה",
      "סדנה",
    ],
  },

  ar: {
    arrival: [
      /^ذهاب إلى (.+)$/u,
      /^الذهاب إلى (.+)$/u,
      /^السفر إلى (.+)$/u,
      /^الوصول إلى (.+)$/u,
      /^طيران إلى (.+)$/u,
      /^قطار إلى (.+)$/u,
      /^حافلة إلى (.+)$/u,
      /^تاكسي إلى (.+)$/u,
      /^الذهاب إلى العمل$/u,
      /^إلى المكتب$/u,
      /^التنقل$/u,
    ],
    departure: [
      /^العودة للمنزل$/u,
      /^العودة إلى المنزل$/u,
      /^المغادرة من (.+)$/u,
      /^ترك (.+)$/u,
      /^مغادرة$/u,
      /^نهاية اليوم$/u,
      /^العودة$/u,
    ],
    workKeywords: [
      "اجتماع",
      "مكالمة",
      "مراجعة",
      "تخطيط",
      "مؤتمر",
      "ورشة عمل",
      "عرض تقديمي",
    ],
  },

  ru: {
    arrival: [
      /^поездка в (.+)$/iu,
      /^ехать в (.+)$/iu,
      /^дорога в (.+)$/iu,
      /^путь в (.+)$/iu,
      /^прибытие в (.+)$/iu,
      /^перелёт в (.+)$/iu,
      /^полёт в (.+)$/iu,
      /^поезд в (.+)$/iu,
      /^автобус в (.+)$/iu,
      /^такси в (.+)$/iu,
      /^на работу$/iu,
      /^в офис$/iu,
      /^дорога на работу$/iu,
    ],
    departure: [
      /^домой$/iu,
      /^дорога домой$/iu,
      /^поездка домой$/iu,
      /^уход с (.+)$/iu,
      /^отъезд из (.+)$/iu,
      /^выезд из (.+)$/iu,
      /^конец дня$/iu,
      /^возвращение$/iu,
      /^обратно$/iu,
    ],
    workKeywords: [
      "встреча",
      "совещание",
      "митинг",
      "звонок",
      "созвон",
      "обзор",
      "ревью",
      "спринт",
      "планирование",
      "ретро",
      "конференция",
      "презентация",
      "воркшоп",
    ],
  },
};

/**
 * @description Combines travel patterns from multiple languages into a single pattern set.
 * Merges arrival patterns, departure patterns, and work keywords from all specified languages,
 * deduplicating work keywords.
 * @param {SupportedEventLanguage[]} languages - Array of language codes to include (e.g., ["en", "de", "fr"]).
 * @returns {TravelPatternSet} Combined pattern set with merged arrival, departure, and work patterns.
 * @example
 * const patterns = getCombinedPatternsForLanguages(["en", "de"]);
 * // patterns.arrival contains both English and German arrival patterns
 * // patterns.workKeywords contains deduplicated keywords from both languages
 */
export function getCombinedPatternsForLanguages(
  languages: SupportedEventLanguage[]
): TravelPatternSet {
  const arrival: RegExp[] = [];
  const departure: RegExp[] = [];
  const workKeywords: string[] = [];

  for (const lang of languages) {
    const patterns = TRAVEL_PATTERNS_BY_LANGUAGE[lang];
    if (patterns) {
      arrival.push(...patterns.arrival);
      departure.push(...patterns.departure);
      workKeywords.push(...patterns.workKeywords);
    }
  }

  return {
    arrival,
    departure,
    workKeywords: [...new Set(workKeywords)],
  };
}

/**
 * @description Matches an event summary against multilingual travel patterns to detect travel-related events.
 * Tests the summary against all regex patterns of the specified type and extracts location if captured.
 * @param {string} summary - The event summary/title to match against patterns.
 * @param {"arrival" | "departure"} type - The type of travel pattern to match.
 * @param {TravelPatternSet} patterns - The combined pattern set from one or more languages.
 * @returns {{ matched: boolean; location: string | null }} Object with match status and extracted location (if any).
 * @example
 * const patterns = getCombinedPatternsForLanguages(["en", "de"]);
 * matchTravelPatternMultilingual("Fahrt nach Berlin", "arrival", patterns);
 * // Returns { matched: true, location: "Berlin" }
 *
 * matchTravelPatternMultilingual("Team meeting", "arrival", patterns);
 * // Returns { matched: false, location: null }
 */
export function matchTravelPatternMultilingual(
  summary: string,
  type: "arrival" | "departure",
  patterns: TravelPatternSet
): { matched: boolean; location: string | null } {
  const regexList = patterns[type];

  for (const pattern of regexList) {
    const match = summary.match(pattern);
    if (match) {
      return {
        matched: true,
        location: match[1]?.trim() || null,
      };
    }
  }

  return { matched: false, location: null };
}

/**
 * @description Determines if an event is work-related based on keyword matching.
 * Performs case-insensitive matching of the event summary against work keywords
 * from the provided pattern set.
 * @param {string} summary - The event summary/title to check.
 * @param {TravelPatternSet} patterns - The pattern set containing work keywords.
 * @returns {boolean} True if the summary contains any work-related keyword.
 * @example
 * const patterns = getCombinedPatternsForLanguages(["en"]);
 * isWorkRelatedEvent("Team standup meeting", patterns); // Returns true
 * isWorkRelatedEvent("Lunch with friends", patterns); // Returns false
 */
export function isWorkRelatedEvent(
  summary: string,
  patterns: TravelPatternSet
): boolean {
  const lowerSummary = summary.toLowerCase();
  return patterns.workKeywords.some((keyword) =>
    lowerSummary.includes(keyword.toLowerCase())
  );
}

export const SUPPORTED_EVENT_LANGUAGES: {
  code: SupportedEventLanguage;
  name: string;
  nativeName: string;
  flag: string;
}[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
];
