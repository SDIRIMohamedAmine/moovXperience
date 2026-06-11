import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../theme/ThemeContext'

let toastId = 0
let listeners = []

// eslint-disable-next-line react-refresh/only-export-components
export function showToast(message, type = 'info', duration = 4000) {
  const id = ++toastId
  const toast = { id, message, type, duration }
  listeners.forEach(fn => fn(toast))
  return id
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])
  const { colors } = useTheme()

  useEffect(() => {
    const handler = (toast) => {
      setToasts(prev => [...prev, toast])
      if (toast.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id))
        }, toast.duration)
      }
    }
    listeners.push(handler)
    return () => { listeners = listeners.filter(l => l !== handler) }
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  if (toasts.length === 0) return null

  const typeStyles = {
    success: { bg: colors.successBg, text: colors.successText, border: colors.successBorder },
    error: { bg: colors.errorBg, text: colors.errorText, border: colors.errorBorder },
    info: { bg: colors.accentLight, text: colors.primary, border: colors.accent },
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" aria-live="polite">
      {toasts.map(toast => {
        const style = typeStyles[toast.type] || typeStyles.info
        return (
          <div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'}
            className="flex items-start gap-3 px-4 py-3 shadow-lg"
            style={{
              backgroundColor: style.bg,
              border: `1px solid ${style.border}`,
              color: style.text,
              fontFamily: 'DM Sans, system-ui, sans-serif',
              animation: 'toastIn 0.3s ease-out',
            }}
          >
            <span className="text-sm flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="text-xs opacity-60 hover:opacity-100 mt-0.5">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
