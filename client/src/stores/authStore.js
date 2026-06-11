import { create } from 'zustand'
import { supabase, getRememberMe } from '../lib/supabase'

let initialized = false
let subscription = null

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  initialize: async () => {
    // Prevent double initialization
    if (initialized) return subscription
    initialized = true

    const remembered = getRememberMe()

    const { data: { session } } = await supabase.auth.getSession()

    if (!remembered && session) {
      await supabase.auth.signOut()
      set({ session: null, user: null, profile: null, loading: false })
      return null
    }

    set({ session, user: session?.user ?? null })

    if (session?.user) {
      await get().fetchProfile(session.user.id)
    }

    set({ loading: false })

    const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user) {
        set({ session: newSession, user: newSession.user })
        await get().fetchProfile(newSession.user.id)
      } else if (event === 'SIGNED_OUT') {
        // Only clear if there's truly no session
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!currentSession) {
          set({ session: null, user: null, profile: null })
        }
      }
    })

    // Listen for storage events to sync auth across tabs
    const handleStorage = (e) => {
      if (e.key?.startsWith('sb-') && e.key?.endsWith('-auth-token')) {
        // Session changed in another tab, re-check
        supabase.auth.getSession().then(({ data: { session: newSession } }) => {
          if (newSession?.user) {
            set({ session: newSession, user: newSession.user })
            get().fetchProfile(newSession.user.id)
          } else {
            set({ session: null, user: null, profile: null })
          }
        })
      }
    }
    window.addEventListener('storage', handleStorage)

    subscription = data.subscription
    return subscription
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) {
      set({ profile: data })
    }
  },

  updateProfile: async (updates) => {
    const user = get().user
    if (!user) return { error: 'Not authenticated' }

    // Only allow specific fields to be updated
    const allowed = {}
    if (updates.full_name !== undefined) allowed.full_name = String(updates.full_name).slice(0, 200)
    if (updates.phone !== undefined) allowed.phone = String(updates.phone).slice(0, 30)

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...allowed, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    if (!error && data) {
      set({ profile: data })
    }
    return { data, error }
  },

  clearAuth: () => {
    set({ user: null, session: null, profile: null })
  },
}))

export { useAuthStore as authStore }
export default useAuthStore
