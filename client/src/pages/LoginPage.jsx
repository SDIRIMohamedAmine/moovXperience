import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../services/authService'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setError(error.message === 'Invalid login credentials' ? t('auth.login_error') : error.message)
      setLoading(false)
      return
    }
    navigate('/dashboard')
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
        <div className="mb-6 p-4 text-sm" style={{ backgroundColor: colors.errorBg, color: colors.errorText, border: `1px solid ${colors.errorBorder}` }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.email')}
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-3 text-sm outline-none transition-colors"
            style={{ border: `1px solid ${colors.border}`, fontFamily: 'DM Sans, system-ui, sans-serif', color: colors.primary }}
            onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.password')}
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-3 text-sm outline-none transition-colors"
            style={{ border: `1px solid ${colors.border}`, fontFamily: 'DM Sans, system-ui, sans-serif', color: colors.primary }}
            onFocus={(e) => (e.target.style.borderColor = colors.inputFocus)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
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
          style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = colors.ctaHover)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
        >
          {loading ? t('auth.login_loading') : t('auth.login_btn')}
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
