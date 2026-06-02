import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../services/authService'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function MainLayout() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { t, lang, toggleLang } = useTranslation()
  const { dark, toggleTheme, colors } = useTheme()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: colors.headerBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl tracking-tight font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textWhite }}>
                Move
              </span>
              <span className="text-xl tracking-tight font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.accent }}>
                Experience
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm tracking-wide uppercase" style={{ color: colors.textMuted, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                onMouseEnter={(e) => (e.target.style.color = colors.textWhite)}
                onMouseLeave={(e) => (e.target.style.color = colors.textMuted)}>
                {t('nav.home')}
              </Link>
              {user && (
                <Link to="/dashboard" className="text-sm tracking-wide uppercase" style={{ color: colors.textMuted, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                  onMouseEnter={(e) => (e.target.style.color = colors.textWhite)}
                  onMouseLeave={(e) => (e.target.style.color = colors.textMuted)}>
                  {t('nav.dashboard')}
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button onClick={toggleTheme} className="text-sm px-2 py-1"
                style={{ border: `1px solid ${colors.overlay}`, color: colors.textMuted, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                onMouseEnter={(e) => { e.target.style.borderColor = colors.accent; e.target.style.color = colors.accent }}
                onMouseLeave={(e) => { e.target.style.borderColor = colors.overlay; e.target.style.color = colors.textMuted }}
                title={dark ? 'Light mode' : 'Dark mode'}>
                {dark ? '☀' : '☾'}
              </button>

              {/* Language toggle */}
              <button onClick={toggleLang} className="text-xs px-2 py-1 uppercase tracking-wider font-medium"
                style={{ border: `1px solid ${colors.overlay}`, color: colors.textMuted, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                onMouseEnter={(e) => { e.target.style.borderColor = colors.accent; e.target.style.color = colors.accent }}
                onMouseLeave={(e) => { e.target.style.borderColor = colors.overlay; e.target.style.color = colors.textMuted }}>
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>

              {user ? (
                <>
                  <Link to="/profile" className="text-sm hidden sm:block" style={{ color: colors.textMuted }}>
                    {profile?.full_name || user?.email}
                  </Link>
                  <button onClick={handleLogout} className="text-sm px-4 py-2 uppercase tracking-wide"
                    style={{ color: colors.textWhite, border: `1px solid ${colors.overlay}`, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                    onMouseEnter={(e) => { e.target.style.borderColor = colors.cta; e.target.style.color = colors.cta }}
                    onMouseLeave={(e) => { e.target.style.borderColor = colors.overlay; e.target.style.color = colors.textWhite }}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm tracking-wide uppercase" style={{ color: colors.textMuted, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                    onMouseEnter={(e) => (e.target.style.color = colors.textWhite)}
                    onMouseLeave={(e) => (e.target.style.color = colors.textMuted)}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="text-sm px-5 py-2 uppercase tracking-wide font-medium"
                    style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = colors.ctaHover)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}>
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: colors.footerBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-lg mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textWhite }}>
                {t('footer.brand')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.textLight }}>
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                {t('footer.navigation')}
              </h4>
              <ul className="space-y-3">
                {[{ to: '/', label: t('nav.home') }, { to: '/register', label: t('nav.register') }, { to: '/login', label: t('nav.login') }].map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-sm" style={{ color: colors.textLight }}
                      onMouseEnter={(e) => (e.target.style.color = colors.textWhite)}
                      onMouseLeave={(e) => (e.target.style.color = colors.textLight)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                {t('footer.contact')}
              </h4>
              <p className="text-sm" style={{ color: colors.textLight }}>contact@move-experience.tn</p>
              <p className="text-sm mt-2" style={{ color: colors.textLight }}>+216 XX XXX XXX</p>
            </div>
          </div>
          <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: `1px solid ${colors.divider}` }}>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              {new Date().getFullYear()} {t('footer.brand')}. {t('footer.rights')}
            </p>
            <div className="flex gap-6">
              {[t('footer.terms'), t('footer.privacy')].map((label) => (
                <span key={label} className="text-xs cursor-pointer" style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => (e.target.style.color = colors.textWhite)}
                  onMouseLeave={(e) => (e.target.style.color = colors.textSecondary)}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
