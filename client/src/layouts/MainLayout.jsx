import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { supabase } from '../lib/supabase'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function MainLayout() {
  const { user, profile } = useAuth()
  const cartCount = useCartStore((s) => s.items.length)
  const navigate = useNavigate()
  const { t, lang, toggleLang } = useTranslation()
  const { colors, dark, toggle: toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  const closeMenu = () => setMenuOpen(false)

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/products', label: t('nav.products') },
    { to: '/rentals', label: t('nav.rentals') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/blog', label: t('nav.blog') },
    ...(user && profile?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: dark ? 'rgba(13,13,13,0.85)' : 'rgba(247,241,222,0.85)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link to="/" className="flex items-center">
              <img src={dark ? '/logo-dark.png' : '/logo-light.png'} alt="MoovXperience" className="h-14 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-xs tracking-[0.15em] uppercase font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language toggle */}
              <button onClick={toggleLang} className="text-xs px-3 py-1 uppercase tracking-wider font-medium transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '9999px' }}
                onMouseEnter={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}>
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="p-2 transition-colors" aria-label="Toggle theme"
                style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.target.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.target.style.color = 'var(--text-secondary)' }}>
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>

              {/* Cart */}
              <Link to="/checkout" className="relative p-2 transition-colors"
                aria-label={`${t('nav.cart')} (${cartCount})`}
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs font-bold rounded-full"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)', fontSize: '10px' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to="/profile" className="hidden sm:flex items-center gap-2 text-xs px-4 py-2 uppercase tracking-wider font-medium transition-all"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '9999px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {t('nav.profile') || 'Mon compte'}
                  </Link>
                  <button onClick={handleLogout} className="hidden sm:block text-xs px-5 py-2.5 uppercase tracking-wider font-semibold transition-all hover:scale-105"
                    style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', cursor: 'pointer', borderRadius: '9999px' }}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs tracking-wider uppercase hidden sm:block transition-colors font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="text-xs px-5 py-2.5 uppercase tracking-wider font-semibold hidden sm:block transition-all hover:scale-105"
                    style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', borderRadius: '9999px' }}>
                    {t('nav.register')}
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}>
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
          <div className="absolute top-0 right-0 h-full w-72 flex flex-col" style={{ backgroundColor: 'var(--bg)', borderLeft: '1px solid var(--border)', animation: 'slideIn 0.3s ease-out' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-lg font-bold gradient-text" style={{  }}>
                Menu
              </span>
              <button onClick={closeMenu} className="p-1" style={{ color: 'var(--text-secondary)' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={closeMenu}
                  className="block py-3 px-4 text-xs uppercase tracking-wider font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)', borderRadius: '8px' }}
                  onMouseEnter={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.backgroundColor = 'var(--accent-bg)' }}
                  onMouseLeave={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.backgroundColor = 'transparent' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
              {user ? (
                <>
                  <Link to="/profile" onClick={closeMenu}
                    className="flex items-center gap-2 py-2.5 px-4 text-xs uppercase tracking-wider font-semibold text-center justify-center"
                    style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', borderRadius: '9999px' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {t('nav.profile') || 'Mon compte'}
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full py-2.5 text-xs uppercase tracking-wider text-center font-medium transition-colors"
                    style={{ color: 'var(--text-on-accent)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '9999px' }}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}
                    className="block py-2.5 text-xs uppercase tracking-wider text-center font-medium transition-colors"
                    style={{ color: 'var(--text-on-accent)', border: '1px solid var(--border)', borderRadius: '9999px' }}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={closeMenu}
                    className="block py-2.5 text-xs uppercase tracking-wider text-center font-semibold transition-all"
                    style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', borderRadius: '9999px' }}>
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
      <footer style={{ backgroundColor: 'var(--bg-overlay)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-4 gradient-text" style={{  }}>
                {t('footer.brand')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] mb-5 font-semibold" style={{ color: 'var(--accent)' }}>
                {t('footer.navigation')}
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] mb-5 font-semibold" style={{ color: 'var(--accent)' }}>
                {t('footer.company')}
              </h4>
              <ul className="space-y-3">
                {[
                  { to: '/about', label: t('footer.about_us') },
                  { to: '/contact', label: t('footer.contact_us') },
                  { to: '/blog', label: t('footer.blog') },
                  { to: '/products', label: t('footer.our_products') },
                  { to: '/rentals', label: t('footer.rentals') },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] mb-5 font-semibold" style={{ color: 'var(--accent)' }}>
                {t('footer.contact')}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>contact@makerskills.tn</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>+216 XX XXX XXX</p>
              <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>{t('footer.maker_skills')}</p>
            </div>
          </div>
          <div className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date().getFullYear()} {t('footer.brand')}. {t('footer.rights')}
            </p>
            <div className="flex gap-6">
              {[t('footer.terms'), t('footer.privacy')].map((label) => (
                <span key={label} className="text-xs cursor-pointer transition-colors" style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}>
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
