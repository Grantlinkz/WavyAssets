/**
 * Smartsupp Live Chat Client Integration
 * Institutional 24/7 Client Desk for WavyAssets User Dashboard
 */

import type { UserEntity } from '../store/useAuthStore';

declare global {
  interface Window {
    _smartsupp?: {
      key?: string;
      custom?: Record<string, unknown>;
      [key: string]: unknown;
    };
    smartsupp?: {
      (...args: unknown[]): void;
      _: unknown[];
    };
  }
}

const SMARTSUPP_SCRIPT_ID = 'smartsupp-loader-script';
const DEFAULT_BRAND_COLOR = '#f2ca50'; // WavyAssets Institutional Gold

/**
 * Returns the configured Smartsupp project key from Vite env or global config
 */
export function getSmartsuppKey(): string {
  if (typeof window !== 'undefined') {
    const envKey = import.meta.env?.VITE_SMARTSUPP_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim();
    }
    if (window._smartsupp?.key) {
      return window._smartsupp.key;
    }
  }
  return '';
}

/**
 * Checks whether the Smartsupp script is loaded and active in the window
 */
export function isSmartsuppLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.smartsupp === 'function';
}

/**
 * Safely dispatches a command to the Smartsupp command queue
 */
export function callSmartsupp(...args: unknown[]): void {
  if (typeof window === 'undefined') return;

  if (typeof window.smartsupp === 'function') {
    window.smartsupp(...args);
    return;
  }

  // If not loaded yet, buffer into the stub queue
  const stub = function (...queuedArgs: unknown[]) {
    (stub as unknown as { _: unknown[] })._ = (stub as unknown as { _: unknown[] })._ || [];
    (stub as unknown as { _: unknown[] })._.push(queuedArgs);
  };
  (stub as unknown as { _: unknown[] })._ = [];
  window.smartsupp = stub as unknown as typeof window.smartsupp;
  stub(...args);
}

/**
 * Initializes and dynamically injects the Smartsupp live chat script
 */
export function initSmartsupp(customKey?: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const key = (customKey || getSmartsuppKey()).trim();
  window._smartsupp = window._smartsupp || {};

  if (key) {
    window._smartsupp.key = key;
  }

  // Prevent duplicate script injection
  if (typeof document.getElementById === 'function' && document.getElementById(SMARTSUPP_SCRIPT_ID)) {
    return true;
  }

  // Initialize the smartsupp stub queue if not yet initialized
  if (!window.smartsupp) {
    const queueStub = function (...args: unknown[]) {
      (queueStub as unknown as { _: unknown[] })._ = (queueStub as unknown as { _: unknown[] })._ || [];
      (queueStub as unknown as { _: unknown[] })._.push(args);
    };
    (queueStub as unknown as { _: unknown[] })._ = [];
    window.smartsupp = queueStub as unknown as typeof window.smartsupp;
  }

  // Set default institutional brand theme
  callSmartsupp('theme:color', DEFAULT_BRAND_COLOR);

  // In test environment or non-browser DOM, do not actually perform network script injection
  if (import.meta.env?.MODE === 'test' || typeof document.createElement !== 'function') {
    return true;
  }

  try {
    const script = document.createElement('script');
    script.id = SMARTSUPP_SCRIPT_ID;
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.src = 'https://www.smartsuppchat.com/loader.js?';

    const firstScript = typeof document.getElementsByTagName === 'function' ? document.getElementsByTagName('script')[0] : null;
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else if (document.head && typeof document.head.appendChild === 'function') {
      document.head.appendChild(script);
    }
    return true;
  } catch (err) {
    console.warn('[Smartsupp] Failed to append loader script:', err);
    return false;
  }
}

/**
 * Synchronizes user identity into Smartsupp chat session
 */
export function identifySmartsuppUser(user: UserEntity | null): void {
  if (!user) return;

  if (user.fullName) {
    callSmartsupp('name', user.fullName);
  }
  if (user.email) {
    callSmartsupp('email', user.email);
  }

  // Supply custom institutional variables
  callSmartsupp('variables', {
    userId: user.id || 'N/A',
    tier: user.tier || 'PRIVATE_WEALTH',
    kycTier: user.kycTier || 'TIER_1',
    isCorporate: user.isCorporate ? 'Yes' : 'No',
    source: 'WavyAssets Institutional Terminal',
  });
}

/**
 * Clears and resets the Smartsupp visitor identity on logout or user switch
 */
export function clearSmartsuppUser(): void {
  callSmartsupp('chat:close');
  callSmartsupp('logout');
}

/**
 * Open the Smartsupp chat widget window
 */
export function openSmartsuppChat(): void {
  const key = getSmartsuppKey();
  if (!key) {
    console.warn('[Smartsupp] Cannot open chat: VITE_SMARTSUPP_KEY is not configured');
    return;
  }
  callSmartsupp('chat:open');
}

/**
 * Close or minimize the Smartsupp chat widget window
 */
export function closeSmartsuppChat(): void {
  callSmartsupp('chat:close');
}

/**
 * Toggle the Smartsupp chat widget open / closed
 */
export function toggleSmartsuppChat(): void {
  callSmartsupp('chat:toggle');
}

/**
 * Hide the Smartsupp chat widget completely from the screen
 */
export function hideSmartsuppChat(): void {
  callSmartsupp('chat:hide');
}

/**
 * Show the Smartsupp chat widget on the screen
 */
export function showSmartsuppChat(): void {
  callSmartsupp('chat:show');
}
