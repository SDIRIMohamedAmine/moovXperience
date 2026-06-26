import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchStats, fetchAllRentals, isAdminLoggedIn, adminLogout } from '../../services/adminService'

import { useTranslation } from '../../i18n/LanguageContext'
import { getDateLocale } from '../../lib/locale'

const statusColors = {
  pending: { bg: '#FF9800', text: '#fff' },
  confirmed: { bg: '#4CAF50', text: '#fff' },
  delivered: { bg: '#7B61FF', text: '#fff' },
  returned: { bg: '#AE59CE', text: '#fff' },
  completed: { bg: '#4CAF50', text: '#fff' },
  cancelled: { bg: '#FF6B6B', text: '#fff' },
}

export default function AdminDashboard() {
  const { t, lang } = useTranslation()
  const [stats, setStats] = useState(null)
  const [recentRentals, setRecentRentals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdminLoggedIn()) return

    Promise.all([
      fetchStats(),
      fetchAllRentals({ limit: 8 }),
    ])
      .then(([statsData, rentalsData]) => {
        setStats(statsData)
        setRecentRentals(rentalsData.rentals || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(getDateLocale(lang), { day: 'numeric', month: 'short' }) : '—'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{  color: '#FFFFFF' }}>
            {t('admin.dashboard')}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>
            {stats?.users || 0} {t('admin.stat_users').toLowerCase()} · {stats?.products || 0} {t('admin.stat_solutions').toLowerCase()} · {stats?.rentals || 0} {t('admin.stat_rentals').toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xs px-3 py-2 transition-colors"
            style={{ color: '#666', border: '1px solid #222' }}>
            {t('admin.site')}
          </Link>
          <button onClick={() => { adminLogout(); window.location.href = '/admin/login' }}
            className="text-xs px-3 py-2 transition-colors"
            style={{ color: '#FF5722', border: '1px solid #FF572230' }}>
            {t('nav.logout')}
          </button>
        </div>
      </div>

      {/* Navigation tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: t('admin.users'), count: stats?.users, to: '/admin/users', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
          { label: t('admin.products'), count: stats?.products, to: '/admin/products', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' },
          { label: t('admin.rentals'), count: stats?.rentals, to: '/admin/rentals', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' },
          { label: t('admin.categories'), count: null, to: '/admin/categories', icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z' },
          { label: t('admin.appearance'), count: null, to: '/admin/appearance', icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z' },
          { label: t('admin.page_editor'), count: null, to: '/admin/page-editor', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' },
          { label: t('admin.blog_management'), count: null, to: '/admin/blog', icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z' },
        ].map((item) => (
          <Link key={item.to} to={item.to}
            className="group flex items-center gap-3 p-4 transition-all"
            style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block truncate" style={{ color: '#FFFFFF' }}>
                {item.label}
              </span>
            </div>
            {item.count != null && (
              <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {item.count}
              </span>
            )}
            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="#666" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <h2 className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#666' }}>
            {t('admin.recent_bookings') || 'Réservations récentes'}
          </h2>
          <Link to="/admin/rentals" className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>
            {t('admin.view_all') || 'Voir tout'} →
          </Link>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid px-5 py-2.5" style={{ gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr 0.8fr', borderBottom: '1px solid #1a1a1a' }}>
          {['Client', 'Dates', 'Status', 'Price', 'Created'].map(h => (
            <span key={h} className="text-xs font-medium uppercase tracking-wider" style={{ color: '#555', fontSize: '10px' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {recentRentals.length > 0 ? recentRentals.map((rental) => {
          const sc = statusColors[rental.status] || { bg: '#666', text: '#fff' }
          return (
            <Link key={rental.id} to="/admin/rentals"
              className="grid items-center px-5 py-3 transition-colors gap-2"
              style={{ gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr 0.8fr', borderBottom: '1px solid #1a1a1a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              {/* Client */}
              <div className="min-w-0">
                <p className="text-sm truncate font-medium" style={{ color: '#FFFFFF' }}>
                  {rental.profiles?.full_name || '—'}
                </p>
              </div>
              {/* Dates */}
              <div className="text-xs" style={{ color: '#aaa' }}>
                {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
              </div>
              {/* Status */}
              <div>
                <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: sc.bg, color: sc.text, fontSize: '11px' }}>
                  {t(`admin.status_${rental.status}`)}
                </span>
              </div>
              {/* Price */}
              <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                {rental.total_price} TND
              </span>
              {/* Created */}
              <span className="text-xs" style={{ color: '#666' }}>
                {formatDate(rental.created_at)}
              </span>
            </Link>
          )
        }) : (
          <p className="px-5 py-12 text-sm text-center" style={{ color: '#555' }}>
            {t('admin.no_rentals') || 'Aucune réservation'}
          </p>
        )}
      </div>
    </div>
  )
}
