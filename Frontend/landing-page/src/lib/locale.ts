/**
 * Sovereign System Language & Locale Engine
 * Automatically detects the user's default operating system / browser language and locale,
 * synchronizes the document root lang attribute, and allows regional formatting overrides.
 */

const LOCALE_STORAGE_KEY = 'wavy_locale';

/**
 * Returns the resolved BCP 47 system locale string (e.g. 'en-US', 'en-GB', 'de-DE', 'fr-FR').
 * Precedence:
 * 1. Explicit user override stored in localStorage ('wavy_locale')
 * 2. Primary browser / OS system language (navigator.languages[0] or navigator.language)
 * 3. Default institutional fallback ('en-US')
 */
export function getSystemLocale(): string {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'en-US';
  }

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Storage access blocked / private browsing mode
  }

  if (window.navigator.languages && window.navigator.languages.length > 0) {
    return window.navigator.languages[0];
  }

  return window.navigator.language || 'en-US';
}

/**
 * Extracts the primary two-letter ISO 639-1 language subtag (e.g. 'en', 'de', 'fr', 'ja').
 */
export function getSystemLanguage(): string {
  const locale = getSystemLocale();
  return locale.split('-')[0].toLowerCase() || 'en';
}

/**
 * Explicitly sets or overrides the preferred regional locale.
 */
export function setLocaleOverride(locale: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Silent fallback if storage is disabled
  }

  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = locale.split('-')[0].toLowerCase();
  }
}

/**
 * Clears any explicit locale override, reverting back to the native system language.
 */
export function clearLocaleOverride(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch {
    // Silent fallback
  }

  initSystemLanguage();
}

/**
 * Initializes and synchronizes <html lang="..."> with the active system language.
 */
export function initSystemLanguage(): string {
  const lang = getSystemLanguage();
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang;
  }
  return lang;
}
