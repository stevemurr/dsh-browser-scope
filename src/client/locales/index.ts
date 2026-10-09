/**
 * Simple i18n locale loader and translation function.
 * Loads en.json and zh.json at build time; the active locale
 * is determined by navigator.language at runtime.
 */

import en from './en.json' with { type: 'json' }
import zh from './zh.json' with { type: 'json' }

const locales: Record<string, Record<string, string>> = {
  en,
  zh,
}

let activeLocale = 'zh' // default to Chinese (original)

/**
 * Set the active locale. Accepts BCP-47 tags like 'en-US', 'zh-CN', etc.
 */
export function setLocale(locale: string): void {
  const tag = locale.toLowerCase().split('-')[0] // 'en-US' -> 'en'
  if (tag && tag in locales) {
    activeLocale = tag
  } else if ('en' in locales) {
    activeLocale = 'en'
  }
}

/**
 * Translate a locale key to the active language.
 * Falls back to the English placeholder if the key is missing.
 */
export function t(key: string): string {
  const dict = locales[activeLocale]
  if (dict && key in dict) {
    return dict[key] as string
  }
  // Fallback: if active is zh and key not found, try en
  if (activeLocale !== 'en' && 'en' in locales && key in locales.en) {
    return locales.en[key] as string
  }
  // Final fallback: return the key itself
  return key
}

/**
 * Get the current active locale tag.
 */
export function getLocale(): string {
  return activeLocale
}

// Auto-detect locale on module load
if (typeof navigator !== 'undefined') {
  setLocale(navigator.language ?? 'en')
}