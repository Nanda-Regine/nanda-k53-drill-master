/**
 * Auth that works both on the web and inside the Capacitor native shell.
 *
 * Web: Supabase redirects the tab back to the origin and parses the session.
 * Native: the webview origin is local, so we open the provider in the system
 * browser, redirect to a custom-scheme deep link, and exchange the PKCE code
 * when the OS hands the URL back via the `appUrlOpen` event.
 *
 * Requires (already configured):
 *  - Supabase Auth → Redirect URLs allowlist contains AUTH_REDIRECT
 *  - AndroidManifest intent-filter for the `za.co.k53drillmaster` scheme
 */
import { supabase } from '../supabase.js';
import { isNative } from './runtime.js';

export const AUTH_REDIRECT = 'za.co.k53drillmaster://auth-callback';

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Auth service unavailable. Contact us on WhatsApp.');

  if (isNative()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: AUTH_REDIRECT, skipBrowserRedirect: true },
    });
    if (error) throw error;
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: data.url });
  } else {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }
}

export async function sendMagicLink(email) {
  if (!supabase) throw new Error('Auth service unavailable. Contact us on WhatsApp.');
  const emailRedirectTo = isNative() ? AUTH_REDIRECT : window.location.origin;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
  if (error) throw error;
}

let _bound = false;
/** Register the deep-link listener that completes sign-in on native. Safe to call once. */
export async function initDeepLinkAuth() {
  if (!isNative() || !supabase || _bound) return;
  _bound = true;
  const { App: CapApp } = await import('@capacitor/app');
  CapApp.addListener('appUrlOpen', async ({ url }) => {
    if (!url || !url.includes('auth-callback')) return;
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      const errDesc = parsed.searchParams.get('error_description');
      if (errDesc) console.warn('OAuth error:', errDesc);
      if (code) await supabase.auth.exchangeCodeForSession(code);
    } catch (e) {
      console.warn('Deep-link auth failed:', e);
    } finally {
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
      } catch {}
    }
  });
}
