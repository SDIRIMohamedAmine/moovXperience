import { useEffect } from 'react'
import useAuthStore from '../stores/authStore'

export default function AuthProvider({ children }) {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    let subscription
    initialize().then((sub) => {
      subscription = sub
    })
    return () => {
      subscription?.unsubscribe()
    }
  }, [initialize])

  return children
}
