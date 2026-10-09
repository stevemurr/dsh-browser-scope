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
 * Falls back to Chinese (original) when the English value is itself a placeholder key.
 */
export function t(key: string): string {
  const dict = locales[activeLocale]
  if (dict && key in dict) {
    const value = dict[key] as string
    // If the value looks like a placeholder (starts with [ or contains : or is a key reference),
    // fall back to Chinese text from zh.json until proper translations are added
    if (activeLocale === 'en' && (value.startsWith('browser.scope.') || value.startsWith('[') || value.includes(':'))) {
      if ('zh' in locales && key in locales.zh) {
        return locales.zh[key] as string
      }
    }
    return value
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