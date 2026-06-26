import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext'
import { EASE } from '../lib/animations'

let confirmId = 0
let listeners = []

// eslint-disable-next-line react-refresh/only-export-components
export function showConfirm(message, onConfirm, onCancel, options = {}) {
  const id = ++confirmId
  const confirm = { id, message, onConfirm, onCancel, ...options }
  listeners.forEach(fn => fn(confirm))
  return id
}

export default function ConfirmModalContainer() {
  const [confirm, setConfirm] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    const handler = (c) => {
      setConfirm(c)
    }
    listeners.push(handler)
    return () => { listeners = listeners.filter(l => l !== handler) }
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirm?.onConfirm) confirm.onConfirm()
    setConfirm(null)
  }, [confirm])

  const handleCancel = useCallback(() => {
    if (confirm?.onCancel) confirm.onCancel()
    setConfirm(null)
  }, [confirm])

  return (
    <AnimatePresence>
      {confirm && (
        <motion.div key="modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}>
          <motion.div className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={handleCancel} />
          <motion.div className="relative max-w-sm w-full mx-4 p-6"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
            }}>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {confirm.message}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={handleCancel}
                className="px-4 py-2 text-sm transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer' }}>
                {confirm.cancelLabel || t('common.cancel')}
              </button>
              <button onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', borderRadius: '9999px', cursor: 'pointer' }}>
                {confirm.confirmLabel || t('common.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
