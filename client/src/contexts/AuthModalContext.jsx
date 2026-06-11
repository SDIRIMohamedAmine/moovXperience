import { createContext, useContext, useState, useCallback } from 'react'
import LoginModal from '../components/LoginModal'

const AuthModalContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider')
  return ctx
}

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [onSuccess, setOnSuccess] = useState(null)

  const showLoginModal = useCallback((callback) => {
    setOnSuccess(() => callback)
    setIsOpen(true)
  }, [])

  const closeLoginModal = useCallback(() => {
    setIsOpen(false)
    setOnSuccess(null)
  }, [])

  const handleSuccess = useCallback(() => {
    setIsOpen(false)
    if (onSuccess) onSuccess()
    setOnSuccess(null)
  }, [onSuccess])

  return (
    <AuthModalContext.Provider value={{ showLoginModal, closeLoginModal }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={closeLoginModal} onSuccess={handleSuccess} />
    </AuthModalContext.Provider>
  )
}
