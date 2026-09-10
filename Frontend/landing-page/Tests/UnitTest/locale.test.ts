import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getSystemLocale,
  getSystemLanguage,
  setLocaleOverride,
  clearLocaleOverride,
  initSystemLanguage,
} from '../../src/lib/locale';

describe('System Language & Locale Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = 'en';
    }
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('detects default system locale and language correctly', () => {
    const locale = getSystemLocale();
    expect(typeof locale).toBe('string');
    expect(locale.length).toBeGreaterThanOrEqual(2);

    const lang = getSystemLanguage();
    expect(typeof lang).toBe('string');
    expect(lang.length).toBe(2);
  });

  it('synchronizes document.documentElement.lang with the system language', () => {
    const lang = initSystemLanguage();
    expect(typeof lang).toBe('string');
    if (typeof document !== 'undefined' && document.documentElement) {
      expect(document.documentElement.lang).toBe(lang);
    }
  });

  it('supports explicit locale override via localStorage wavy_locale', () => {
    setLocaleOverride('ja-JP');
    expect(getSystemLocale()).toBe('ja-JP');
    expect(getSystemLanguage()).toBe('ja');
    if (typeof document !== 'undefined' && document.documentElement) {
      expect(document.documentElement.lang).toBe('ja');
    }

    setLocaleOverride('de-DE');
    expect(getSystemLocale()).toBe('de-DE');
    expect(getSystemLanguage()).toBe('de');
    if (typeof document !== 'undefined' && document.documentElement) {
      expect(document.documentElement.lang).toBe('de');
    }

    clearLocaleOverride();
    expect(localStorage.getItem('wavy_locale')).toBeNull();
  });
});
