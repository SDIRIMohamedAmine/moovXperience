import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE } from '../lib/animations'

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

  const typeColors = {
    success: { bg: 'var(--status-accepted-bg)', text: 'var(--status-accepted-text)', border: 'var(--status-accepted-text)' },
    error: { bg: 'var(--status-refused-bg)', text: 'var(--status-refused-text)', border: 'var(--status-refused-text)' },
    info: { bg: 'var(--accent-bg)', text: 'var(--text-primary)', border: 'var(--accent)' },
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const style = typeColors[toast.type] || typeColors.info
          return (
            <motion.div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="flex items-start gap-3 px-4 py-3"
              style={{
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                color: style.text,
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span className="text-sm flex-1">{toast.message}</span>
              <button onClick={() => dismiss(toast.id)}
                className="text-xs opacity-60 hover:opacity-100 mt-0.5 transition-opacity"
                style={{ cursor: 'pointer' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
