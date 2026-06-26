import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeInUp } from '../lib/animations'
import { signIn } from '../services/authService'
import { adminLogin } from '../services/adminService'
import { authStore } from '../stores/authStore'
import { useTranslation } from '../i18n/LanguageContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: supabaseError } = await signIn(email, password, remember)

    if (!supabaseError) {
      const { supabase } = await import('../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile?.role === 'admin') {
          try { await adminLogin(email, password) } catch {}
          navigate('/admin')
          return
        }
      }
      navigate('/')
      return
    }

    try {
      const adminData = await adminLogin(email, password)
      authStore.setState({
        user: { id: null, email: adminData.user?.email || email, user_metadata: { full_name: 'Admin' } },
        session: null,
        profile: { role: 'admin', full_name: 'Admin' },
        loading: false,
      })
      navigate('/admin')
      return
    } catch {
      setError(t('auth.login_error'))
    }

    setLoading(false)
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-8 md:p-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--accent)' }}>
            {t('auth.welcome')}
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('auth.login_title')}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-center"
            style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
              {t('auth.email')}
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
              {t('auth.password')}
            </label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{ ...inputStyle, paddingRight: '48px' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }} tabIndex={-1}>
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
            <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4" style={{ accentColor: 'var(--accent)' }} />
            <label htmlFor="remember" className="text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              {t('auth.remember_me')}
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 text-sm uppercase tracking-widest font-bold transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--accent-gradient)',
              color: 'var(--text-on-accent)',
              borderRadius: '9999px',
              boxShadow: '0 4px 20px rgba(196,30,94,0.3)',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
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

        <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          {t('auth.no_account')}{' '}
          <Link to="/register" className="font-medium" style={{ color: 'var(--accent)' }}>
            {t('nav.register')}
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
