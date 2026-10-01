import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves the WavyAssets Landing Page / Showcase URL across environments.
 * In local dev, falls back to http://localhost:5173.
 * In production (e.g. Vercel / custom domain), falls back to https://wavy-assets.vercel.app
 * rather than appending port :5173 to the production hostname.
 */
export function getLandingUrl(): string {
  if (import.meta.env.VITE_LANDING_URL) {
    return import.meta.env.VITE_LANDING_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:5173`;
    }
    return 'https://wavy-assets.vercel.app';
  }
  return 'http://localhost:5173';
}

