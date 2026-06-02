import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Remember me helpers
export function setRememberMe(remember) {
  if (remember) {
    localStorage.setItem('rememberMe', 'true')
  } else {
    localStorage.setItem('rememberMe', 'false')
  }
}

export function getRememberMe() {
  return localStorage.getItem('rememberMe') !== 'false'
}

export async function clearSessionIfNotRemembered() {
  if (!getRememberMe()) {
    await supabase.auth.signOut()
  }
}
