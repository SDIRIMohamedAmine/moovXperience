import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../services/authService'
import { useTranslation } from '../i18n/LanguageContext'
import PasswordStrength from '../components/PasswordStrength'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
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
    const metadata = { full_name: fullName.trim(), phone: phone.trim(), company_name: companyName.trim() }
    const { data, error } = await signUp(email, password, 'client', metadata, remember)
    if (error) {
      const isDuplicate = error.message?.toLowerCase().includes('already') || error.message?.toLowerCase().includes('exists')
      setError(isDuplicate ? t('auth.user_exists') : t('common.error'))
      setLoading(false)
      return
    }
    if (data.user && !data.session) {
      setSuccess(`${t('auth.confirm_email_msg')} ${email}. ${t('auth.confirm_email_action')}`)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ backgroundColor: '#141414', border: '1px solid #222' }} className="p-8 md:p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(210,58,176,0.1)' }}>
          <svg className="w-8 h-8" fill="none" stroke="#D23AB0" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-2xl mb-3 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('auth.confirm_email_title')}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
          {success}
        </p>
        <Link to="/login" className="text-sm font-medium" style={{ color: '#D23AB0' }}>
          {t('auth.go_to_login')}
        </Link>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#141414', border: '1px solid #222' }} className="p-8 md:p-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
          {t('auth.join_us')}
        </p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('auth.register_title')}
        </h1>
        <p className="text-sm mt-2" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
          {t('auth.register_subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm" role="alert"
          style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)', fontFamily: 'Outfit, sans-serif' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
              {t('auth.full_name')} *
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="w-full px-4 py-3 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
              onFocus={(e) => (e.target.style.borderColor = '#D23AB0')} onBlur={(e) => (e.target.style.borderColor = '#222')} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
              {t('auth.phone')}
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
              onFocus={(e) => (e.target.style.borderColor = '#D23AB0')} onBlur={(e) => (e.target.style.borderColor = '#222')} />
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.company_name')}
          </label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-3 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
            onFocus={(e) => (e.target.style.borderColor = '#D23AB0')} onBlur={(e) => (e.target.style.borderColor = '#222')} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.email')} *
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            className="w-full px-4 py-3 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
            onFocus={(e) => (e.target.style.borderColor = '#D23AB0')} onBlur={(e) => (e.target.style.borderColor = '#222')} />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.password')} *
          </label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
              autoComplete="new-password" minLength={6}
              className="w-full px-4 py-3 pr-12 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
              onFocus={(e) => (e.target.style.borderColor = '#D23AB0')} onBlur={(e) => (e.target.style.borderColor = '#222')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#666' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.confirm_password')} *
          </label>
          <div className="relative">
            <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
              onFocus={(e) => (e.target.style.borderColor = '#D23AB0')} onBlur={(e) => (e.target.style.borderColor = '#222')} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#666' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                {showConfirmPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 accent-[#D23AB0]" />
          <label htmlFor="remember" className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.remember_me')}
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full py-3.5 text-sm uppercase tracking-widest font-bold transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #D23AB0, #AE59CE)',
            color: '#FFFFFF',
            fontFamily: 'Outfit, sans-serif',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('auth.register_loading')}
            </span>
          ) : t('auth.register_btn')}
        </button>

        <p className="text-sm text-center" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
          {t('auth.already_account')}{' '}
          <Link to="/login" className="font-medium" style={{ color: '#D23AB0' }}>
            {t('nav.login')}
          </Link>
        </p>
      </form>
    </div>
  )
}
