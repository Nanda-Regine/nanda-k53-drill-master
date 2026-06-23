import { createClient } from "@supabase/supabase-js";
import { isNative } from "./utils/runtime.js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("Supabase env vars missing — auth features disabled.");
}

// On the native shell we drive OAuth/magic-link through a deep link and
// exchange the code manually, so disable URL auto-detection and use PKCE.
// Web keeps Supabase defaults so the existing flow is untouched.
const nativeAuthOpts = {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
  },
};

export const supabase = url && key
  ? createClient(url, key, isNative() ? nativeAuthOpts : undefined)
  : null;
