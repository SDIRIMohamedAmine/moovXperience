import { supabase, setRememberMe } from '../lib/supabase'

export async function signUp(email, password, role, metadata = {}, remember = true) {
  setRememberMe(remember)

  // Password policy: min 8 chars, at least 1 letter and 1 number
  if (password.length < 8) {
    return { data: null, error: { message: 'Le mot de passe doit contenir au moins 8 caractères' } }
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { data: null, error: { message: 'Le mot de passe doit contenir au moins une lettre et un chiffre' } }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, ...metadata },
    },
  })
  return { data, error }
}

export async function signIn(email, password, remember = true) {
  setRememberMe(remember)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
