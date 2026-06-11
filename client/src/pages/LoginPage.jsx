import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../services/authService'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { colors } = useTheme()

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
    navigate('/')
  }

  return (
    <div style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }} className="p-8 md:p-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('auth.welcome')}
        </p>
        <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
          {t('auth.login_title')}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm" role="alert" style={{ backgroundColor: colors.errorBg, color: colors.errorText, border: `1px solid ${colors.errorBorder}` }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.email')}
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-3 text-sm transition-colors"
            style={{ border: `1px solid ${colors.border}`, fontFamily: 'DM Sans, system-ui, sans-serif', color: colors.primary }}
            onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.password')}
          </label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 pr-12 text-sm transition-colors"
              style={{ border: `1px solid ${colors.border}`, fontFamily: 'DM Sans, system-ui, sans-serif', color: colors.primary }}
              onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: colors.textSecondary }}
              tabIndex={-1}
            >
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

        {/* Keep me logged in */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="remember" className="text-sm cursor-pointer" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.remember_me')}
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 text-sm uppercase tracking-widest font-medium transition-colors"
          style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = colors.ctaHover)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
        >
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

      <p className="mt-6 text-sm text-center" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        {t('auth.no_account')}{' '}
        <Link to="/register" className="font-medium" style={{ color: colors.accent }}
          onMouseEnter={(e) => (e.target.style.color = colors.primary)}
          onMouseLeave={(e) => (e.target.style.color = colors.accent)}>
          {t('nav.register')}
        </Link>
      </p>
    </div>
  )
}
