import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { signIn } from '../services/authService'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form when modal closes
  if (!isOpen && (email || password || error)) {
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setError('')
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password, remember)
    if (error) {
      setError(t('auth.login_error'))
      setLoading(false)
      return
    }
    onSuccess()
  }

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdrop}
    >
      <div
        className="relative w-full max-w-md"
        style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: colors.textSecondary }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent }}>
              {t('auth.welcome')}
            </p>
            <h2 className="text-2xl" style={{  color: colors.primary, fontWeight: 600 }}>
              {t('auth.login_title')}
            </h2>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              {t('auth.login_required_action')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm" role="alert" style={{ backgroundColor: colors.errorBg, color: colors.errorText, border: `1px solid ${colors.errorBorder}` }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
                {t('auth.email')}
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                className="w-full px-4 py-3 text-sm transition-colors"
                style={{ border: `1px solid ${colors.border}`, color: colors.primary }}
                onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                onBlur={(e) => (e.target.style.borderColor = colors.border)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 pr-12 text-sm transition-colors"
                  style={{ border: `1px solid ${colors.border}`, color: colors.primary }}
                  onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: colors.textSecondary }} tabIndex={-1}>
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="modal-remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="modal-remember" className="text-sm cursor-pointer" style={{ color: colors.textSecondary }}>
                {t('auth.remember_me')}
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 text-sm uppercase tracking-widest font-medium transition-colors"
              style={{ backgroundColor: colors.cta, color: colors.textWhite, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = colors.ctaHover)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.login_loading')}
                </span>
              ) : t('auth.login_btn')}
            </button>
          </form>

          <p className="mt-4 text-sm text-center" style={{ color: colors.textLight }}>
            {t('auth.no_account')}{' '}
            <Link to="/register" onClick={onClose} className="font-medium" style={{ color: colors.accent }}>
              {t('nav.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
