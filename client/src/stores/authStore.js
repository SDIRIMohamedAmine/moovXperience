import { create } from 'zustand'
import { supabase, getRememberMe } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  initialize: async () => {
    // Check remember me preference
    const remembered = getRememberMe()

    if (!remembered) {
      // If not remembered, clear any persisted session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Session exists but user didn't want to be remembered — clear it
        await supabase.auth.signOut()
        set({ session: null, user: null, profile: null, loading: false })
        return
      }
    }

    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })

    if (session?.user) {
      await get().fetchProfile(session.user.id)
    }

    set({ loading: false })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      } else {
        set({ profile: null })
      }
    })

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
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
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
