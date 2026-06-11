import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { signOut } from '../services/authService'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function MainLayout() {
  const { user, profile } = useAuth()
  const cartCount = useCartStore((s) => s.items.length)
  const navigate = useNavigate()
  const { t, lang, toggleLang } = useTranslation()
  const { colors } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    authStore.setState({ user: null, session: null, profile: null })
    setMenuOpen(false)
    window.location.href = '/'
  }

  const closeMenu = () => setMenuOpen(false)

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/catalog', label: t('nav.catalog') },
    ...(user && profile?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(13,13,13,0.85)', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-xl font-bold tracking-tight gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Moov
              </span>
              <span className="text-xl font-light tracking-tight" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
                Xperience
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-xs tracking-[0.15em] uppercase font-medium transition-colors"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}
                  onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.target.style.color = '#666')}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <button onClick={toggleLang} className="text-xs px-2.5 py-1 uppercase tracking-wider font-medium transition-colors"
                style={{ border: '1px solid #222', color: '#666', fontFamily: 'Outfit, sans-serif' }}
                onMouseEnter={(e) => { e.target.style.borderColor = '#D23AB0'; e.target.style.color = '#D23AB0' }}
                onMouseLeave={(e) => { e.target.style.borderColor = '#222'; e.target.style.color = '#666' }}>
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>

              {/* Cart */}
              <Link to="/checkout" className="relative p-2 transition-colors"
                aria-label={`${t('nav.cart')} (${cartCount})`}
                style={{ color: '#666' }}
                onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.target.style.color = '#666')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs font-bold rounded-full"
                    style={{ backgroundColor: '#D23AB0', color: '#FFFFFF', fontSize: '10px' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to="/profile" className="text-sm hidden sm:block transition-colors font-medium" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                    {profile?.full_name || user?.email}
                  </Link>
                  <button onClick={handleLogout} className="text-xs px-4 py-2 uppercase tracking-wider font-medium transition-colors"
                    style={{ color: '#FFFFFF', border: '1px solid #222', fontFamily: 'Outfit, sans-serif' }}
                    onMouseEnter={(e) => { e.target.style.borderColor = '#D23AB0'; e.target.style.color = '#D23AB0' }}
                    onMouseLeave={(e) => { e.target.style.borderColor = '#222'; e.target.style.color = '#FFFFFF' }}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs tracking-wider uppercase hidden sm:block transition-colors font-medium"
                    style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}
                    onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.target.style.color = '#666')}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="text-xs px-5 py-2.5 uppercase tracking-wider font-semibold hidden sm:block transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #D23AB0, #AE59CE)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                    {t('nav.register')}
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 transition-colors"
                style={{ color: '#666' }}
                onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.target.style.color = '#666')}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={closeMenu} />
          <div className="absolute top-0 right-0 h-full w-72 flex flex-col" style={{ backgroundColor: '#0D0D0D', borderLeft: '1px solid #1a1a1a', animation: 'slideIn 0.3s ease-out' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <span className="text-lg font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Menu
              </span>
              <button onClick={closeMenu} className="p-1" style={{ color: '#666' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={closeMenu}
                  className="block py-3 px-4 text-xs uppercase tracking-wider font-medium transition-colors"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}
                  onMouseEnter={(e) => { e.target.style.color = '#FFFFFF'; e.target.style.backgroundColor = 'rgba(210,58,176,0.05)' }}
                  onMouseLeave={(e) => { e.target.style.color = '#666'; e.target.style.backgroundColor = 'transparent' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 space-y-3" style={{ borderTop: '1px solid #1a1a1a' }}>
              {user ? (
                <>
                  <Link to="/profile" onClick={closeMenu}
                    className="block py-2 px-4 text-sm font-medium" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                    {profile?.full_name || user?.email}
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full py-2.5 text-xs uppercase tracking-wider text-center font-medium transition-colors"
                    style={{ color: '#FFFFFF', border: '1px solid #222', fontFamily: 'Outfit, sans-serif' }}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}
                    className="block py-2.5 text-xs uppercase tracking-wider text-center font-medium transition-colors"
                    style={{ color: '#FFFFFF', border: '1px solid #222', fontFamily: 'Outfit, sans-serif' }}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={closeMenu}
                    className="block py-2.5 text-xs uppercase tracking-wider text-center font-semibold transition-all"
                    style={{ background: 'linear-gradient(135deg, #D23AB0, #AE59CE)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0A0A0A', borderTop: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-4 gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {t('footer.brand')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] mb-5 font-semibold" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
                {t('footer.navigation')}
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm transition-colors" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}
                      onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                      onMouseLeave={(e) => (e.target.style.color = '#666')}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] mb-5 font-semibold" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
                {t('nav.register')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/register" className="text-sm transition-colors" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}
                    onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.target.style.color = '#666')}>
                    {t('auth.client')}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm transition-colors" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}
                    onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.target.style.color = '#666')}>
                    {t('auth.supplier')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] mb-5 font-semibold" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
                {t('footer.contact')}
              </h4>
              <p className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>contact@makerskills.tn</p>
              <p className="text-sm mt-2" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>+216 XX XXX XXX</p>
              <p className="text-xs mt-4" style={{ color: '#444', fontFamily: 'Outfit, sans-serif' }}>{t('footer.maker_skills')}</p>
            </div>
          </div>
          <div className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid #1a1a1a' }}>
            <p className="text-xs" style={{ color: '#444', fontFamily: 'Outfit, sans-serif' }}>
              {new Date().getFullYear()} {t('footer.brand')}. {t('footer.rights')}
            </p>
            <div className="flex gap-6">
              {[t('footer.terms'), t('footer.privacy')].map((label) => (
                <span key={label} className="text-xs cursor-pointer transition-colors" style={{ color: '#444', fontFamily: 'Outfit, sans-serif' }}
                  onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.target.style.color = '#444')}>
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
