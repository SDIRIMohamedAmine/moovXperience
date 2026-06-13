import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchStats, isAdminLoggedIn, adminLogout } from '../../services/adminService'
import { useTranslation } from '../../i18n/LanguageContext'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const statCards = stats => [
    { label: t('admin.stat_users'), value: stats.users, icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', color: '#D23AB0', to: '/admin/users' },
    { label: t('admin.stat_suppliers'), value: stats.suppliers, icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21', color: '#7B61FF', to: '/admin/users' },
    { label: t('admin.stat_clients'), value: stats.clients, icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', color: '#4CAF50', to: '/admin/users' },
    { label: t('admin.stat_solutions'), value: stats.products, icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z', color: '#FF9800', to: '/admin/products' },
    { label: t('admin.stat_rentals'), value: stats.rentals, icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12', color: '#AE59CE', to: '/admin/rentals' },
    { label: t('admin.stat_pending_quotes'), value: stats.pendingQuotes, icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', color: '#FF5722', to: '/admin/rentals' },
  ]

  useEffect(() => {
    if (isAdminLoggedIn()) {
      fetchStats()
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
            {t('admin.login_title')}
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
            {t('admin.dashboard')}
          </h1>
        </div>
        <div className="flex items-center gap-3 relative z-[60]">
          <Link to="/" className="text-xs px-4 py-2 uppercase tracking-wider font-medium transition-colors cursor-pointer"
            style={{ color: '#666', border: '1px solid #222', fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>
            {t('admin.site')}
          </Link>
          <button type="button" onClick={() => { adminLogout(); window.location.href = '/admin/login' }}
            className="text-xs px-4 py-2 uppercase tracking-wider font-medium transition-colors cursor-pointer"
            style={{ color: '#FF5722', border: '1px solid #FF572244', fontFamily: 'Outfit, sans-serif', cursor: 'pointer', position: 'relative', zIndex: 60 }}>
            {t('nav.logout')}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {stats && statCards(stats).map((card) => (
          <Link key={card.label} to={card.to}
            className="group p-5 transition-all hover:translate-y-[-2px]"
            style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.boxShadow = `0 8px 30px ${card.color}22` }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.boxShadow = 'none' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                <svg className="w-6 h-6" fill="none" stroke={card.color} strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: card.color }}>
                  {card.value}
                </div>
                <div className="text-xs uppercase tracking-wider font-medium" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {card.label}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
        {t('admin.quick_actions')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('admin.manage_users'), to: '/admin/users', color: '#D23AB0' },
          { label: t('admin.manage_products'), to: '/admin/products', color: '#7B61FF' },
          { label: t('admin.view_rentals'), to: '/admin/rentals', color: '#AE59CE' },
          { label: t('admin.manage_categories'), to: '/admin/categories', color: '#FF9800' },
        ].map((link) => (
          <Link key={link.to} to={link.to}
            className="flex items-center gap-3 p-4 transition-all"
            style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }} />
            <span className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
              {link.label}
            </span>
            <svg className="w-4 h-4 ml-auto" fill="none" stroke="#666" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
