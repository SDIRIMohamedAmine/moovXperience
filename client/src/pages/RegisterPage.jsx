import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../services/authService'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('client')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password !== confirmPassword) { setError(t('auth.password_mismatch')); return }
    if (password.length < 6) { setError(t('auth.password_min')); return }
    setLoading(true)
    const { data, error } = await signUp(email, password, role, remember)
    if (error) {
      setError(error.message === 'User already registered' ? t('auth.user_exists') : error.message)
      setLoading(false)
      return
    }
    if (data.user && !data.session) {
      setSuccess(`${t('auth.confirm_email_msg')} ${email}. ${t('auth.confirm_email_action')}`)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }} className="p-8 md:p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: colors.accentLight }}>
          <svg className="w-8 h-8" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-2xl mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
          {t('auth.confirm_email_title')}
        </h2>
        <p className="text-sm mb-6" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {success}
        </p>
        <Link to="/login" className="text-sm font-medium" style={{ color: colors.accent }}
          onMouseEnter={(e) => (e.target.style.color = colors.primary)}
          onMouseLeave={(e) => (e.target.style.color = colors.accent)}>
          {t('auth.go_to_login')}
        </Link>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }} className="p-8 md:p-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('auth.join_us')}
        </p>
        <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
          {t('auth.register_title')}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm" style={{ backgroundColor: colors.errorBg, color: colors.errorText, border: `1px solid ${colors.errorBorder}` }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider mb-3" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.i_am')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'client', label: t('auth.client'), desc: t('auth.client_desc') },
              { value: 'supplier', label: t('auth.supplier'), desc: t('auth.supplier_desc') },
            ].map((opt) => (
              <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                className="p-4 text-left transition-all"
                style={{
                  border: role === opt.value ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                  backgroundColor: role === opt.value ? colors.accentLight : colors.bgWhite,
                }}>
                <div className="text-sm font-medium mb-1" style={{ color: role === opt.value ? colors.primary : colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {opt.label}
                </div>
                <div className="text-xs" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

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

        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.confirm_password')}
          </label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
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
            id="remember-register"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="remember-register" className="text-sm cursor-pointer" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('auth.remember_me')}
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 text-sm uppercase tracking-widest font-medium transition-colors"
          style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = colors.ctaHover)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
        >
          {loading ? t('auth.register_loading') : t('auth.register_btn')}
        </button>
      </form>

      <p className="mt-6 text-sm text-center" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        {t('auth.already_account')}{' '}
        <Link to="/login" className="font-medium" style={{ color: colors.accent }}
          onMouseEnter={(e) => (e.target.style.color = colors.primary)}
          onMouseLeave={(e) => (e.target.style.color = colors.accent)}>
          {t('nav.login')}
        </Link>
      </p>
    </div>
  )
}
