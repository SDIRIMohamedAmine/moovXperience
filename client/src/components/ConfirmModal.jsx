import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../theme/ThemeContext'
import { useTranslation } from '../i18n/LanguageContext'

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
  const { colors } = useTheme()
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

  if (!confirm) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCancel} />
      <div className="relative max-w-sm w-full mx-4 p-6"
        style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}`, animation: 'confirmIn 0.2s ease-out' }}>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {confirm.message}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={handleCancel}
            className="px-4 py-2 text-sm transition-colors"
            style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {confirm.cancelLabel || t('common.cancel')}
          </button>
          <button onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {confirm.confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes confirmIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
