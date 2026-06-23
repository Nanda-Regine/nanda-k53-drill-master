/**
 * Runtime environment helpers for the Capacitor native shell.
 *
 * On the web the app is served same-origin, so /api/* calls use the current
 * origin. Inside the Capacitor webview the origin is a local scheme
 * (http://localhost), so server calls must point at the live production site.
 */
import { Capacitor } from '@capacitor/core';

// Canonical production origin (matches server SITE_URL default).
export const PROD_ORIGIN = 'https://k53drillmaster.co.za';

export function isNative() {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
}

/** Prefix for /api/* calls: '' on web (same-origin), prod origin in the native shell. */
export function apiBase() {
  return isNative() ? PROD_ORIGIN : '';
}

/**
 * Open PayFast checkout. On web we navigate the tab; in the native shell we
 * open the system browser so the app isn't hijacked — the server-side ITN
 * webhook activates the subscription regardless, and the user signs in to sync.
 */
export async function openCheckout(plan) {
  const url = `${apiBase()}/api/checkout?plan=${plan}`;
  if (isNative()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.location.href = url;
  }
}
