const DEFAULT_COLOR = '#6366f1'

/**
 * Validates a hex color string and returns a valid color or default
 * @param color - The color string to validate
 * @param fallback - Optional fallback color (defaults to #6366f1)
 * @returns A valid hex color string
 */
export const getValidHexColor = (color: string | undefined | null, fallback: string = DEFAULT_COLOR): string => {
  if (!color || typeof color !== 'string') return fallback
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return color
  }
  return fallback
}

/**
 * Activity level color mappings for heatmaps
 * Returns Tailwind CSS classes based on activity level
 */
export const getActivityLevelColor = (level: number): string => {
  if (level === 0) return 'bg-zinc-100 dark:bg-zinc-800/50'
  if (level < 5) return 'bg-primary/20'
  if (level < 10) return 'bg-primary/40'
  if (level < 15) return 'bg-primary/70'
  return 'bg-primary'
}

export type HealthActivity = 'Gym' | 'Run' | 'Swim' | 'Rest'

/**
 * Health activity color mappings
 * Returns Tailwind CSS classes based on health activity type
 */
export const getHealthActivityColor = (type: HealthActivity): string => {
  switch (type) {
    case 'Gym':
      return 'bg-emerald-500'
    case 'Run':
      return 'bg-sky-500'
    case 'Swim':
      return 'bg-indigo-500'
    default:
      return 'bg-zinc-100 dark:bg-zinc-800/50'
  }
}

export type InsightColor = 'amber' | 'sky' | 'emerald' | 'rose' | 'indigo' | 'orange'

/**
 * Insight card color classes mapping
 * Returns background and text color classes for insight cards
 */
export const getInsightColorClasses = (color: InsightColor): { bg: string; text: string } => {
  const colorClasses: Record<InsightColor, { bg: string; text: string }> = {
    amber: { bg: 'bg-amber-100/50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-500' },
    sky: { bg: 'bg-sky-100/50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-500' },
    emerald: { bg: 'bg-emerald-100/50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-500' },
    rose: { bg: 'bg-rose-100/50 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-500' },
    indigo: { bg: 'bg-indigo-100/50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-500' },
    orange: { bg: 'bg-orange-100/50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-500' },
  }
  return colorClasses[color] || colorClasses.amber
}
