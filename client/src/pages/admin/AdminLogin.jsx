import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n/LanguageContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/admin-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('admin.login_error'))
        setLoading(false)
        return
      }

      // Store admin token
      localStorage.setItem('admin-token', data.token)
      localStorage.setItem('admin-user', JSON.stringify(data.user))
      // Force reload so auth store picks up the admin token
      window.location.href = '/admin'
    } catch (err) {
      setError(t('admin.connection_error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="w-full max-w-md p-8" style={{ backgroundColor: '#141414', border: '1px solid #222' }}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold gradient-text mb-2" style={{  }}>
            MoovXperience
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: 'var(--accent)' }}>
            {t('admin.login_title')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-center"
            style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666' }}>
              {t('auth.email')}
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = '#222')} />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666' }}>
              {t('auth.password')}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 text-sm" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = '#222')} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 text-sm uppercase tracking-widest font-bold transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #AE59CE)',
              color: '#FFFFFF',
              
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('admin.login_loading')}
              </span>
            ) : t('admin.login_btn')}
          </button>
        </form>
      </div>
    </div>
  )
}
