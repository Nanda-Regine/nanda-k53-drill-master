// Test-only: resolve @supabase/supabase-js to a stub so unit tests need no install.
import { register } from 'node:module';
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(s, c, next) {
  if (s === '@supabase/supabase-js') return { url: 'data:text/javascript,export const createClient=()=>{throw new Error("stub")}', shortCircuit: true };
  return next(s, c);
}`));
