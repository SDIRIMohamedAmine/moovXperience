import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getFreshToken } from '../lib/supabase'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { fetchMyProducts } from '../services/productService'
import { motion } from 'framer-motion'
import { fadeInUp, stagger, scaleIn, viewportOnce } from '../lib/animations'
import { fetchMyRentals } from '../services/rentalService'

function StatCard({ icon, value, label, description, to, color, colors }) {
  return (
    <Link to={to} className="group block transition-all duration-300 hover:translate-y-[-2px]"
      style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 8px 30px ${color}22` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div className="flex">
        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="p-5 flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
              {icon}
            </div>
            <div className="text-2xl font-light" style={{ color: color }}>
              {value ?? '...'}
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.15em] mb-1 font-medium" style={{ color: colors.primary }}>
            {label}
          </p>
          <p className="text-xs" style={{ color: colors.textLight }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

function QuickAction({ icon, label, to, colors }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-4 transition-all duration-300"
      style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.backgroundColor = colors.accentLight }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = colors.bgWhite }}
    >
      <div className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.accentLight }}>
        {icon}
      </div>
      <span className="text-sm font-medium" style={{ color: colors.primary }}>
        {label}
      </span>
      <svg className="w-4 h-4 ml-auto" fill="none" stroke={colors.textLight} strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  )
}

export default function DashboardPage() {
  const { profile, session } = useAuth()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [productCount, setProductCount] = useState(null)
  const [rentalCount, setRentalCount] = useState(null)
  const [pendingCount, setPendingCount] = useState(null)
  const [recentRentals, setRecentRentals] = useState([])

  useEffect(() => {
    if (profile?.role === 'supplier') {
      getFreshToken().then(token => {
        if (!token) return
        fetchMyProducts(token)
          .then((data) => setProductCount(data.length))
          .catch(() => setProductCount(0))
        fetchMyRentals(token)
          .then((data) => {
            const pending = data.filter(r => r.status === 'pending').length
            setRentalCount(data.length)
            setPendingCount(pending)
            setRecentRentals(data.slice(0, 3))
          })
          .catch(() => { setRentalCount(0); setPendingCount(0) })
      })
    } else if (profile?.role === 'client') {
      getFreshToken().then(token => {
        if (!token) return
        fetchMyRentals(token)
          .then((data) => {
            const pending = data.filter(r => r.status === 'pending').length
            setRentalCount(data.length)
            setPendingCount(pending)
            setRecentRentals(data.slice(0, 3))
          })
          .catch(() => { setRentalCount(0); setPendingCount(0) })
      })
    }
  }, [profile])

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
      </div>
    )
  }

  const isSupplier = profile.role === 'supplier'
  const displayName = profile.full_name || (isSupplier ? t('dashboard.supplier_default') : t('dashboard.client_default'))
  const initial = (profile.full_name || (isSupplier ? 'F' : 'C')).charAt(0).toUpperCase()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome section */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium"
          style={{ backgroundColor: colors.accent, color: colors.textWhite }}>
          {initial}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: colors.accent }}>
            {isSupplier ? t('dashboard.supplier_space') : t('dashboard.client_space')}
          </p>
          <h1 className="text-2xl md:text-3xl" style={{ color: colors.primary, fontWeight: 500 }}>
            {t('dashboard.welcome')}, {displayName}
          </h1>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {isSupplier ? (
          <>
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
              value={productCount}
              label={t('dashboard.my_products')}
              description={t('dashboard.my_products_desc')}
              to="/supplier/products"
              color={colors.accent}
              colors={colors}
            />
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" stroke="#FF9800" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>}
              value={rentalCount}
              label={t('dashboard.orders')}
              description={t('dashboard.orders_desc')}
              to="/supplier/orders"
              color="#FF9800"
              colors={colors}
            />
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" stroke={colors.cta} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              value={pendingCount}
              label={t('dashboard.pending')}
              description={t('dashboard.pending_desc')}
              to="/supplier/orders"
              color={colors.cta}
              colors={colors}
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>}
              value={rentalCount}
              label={t('dashboard.my_rentals')}
              description={t('dashboard.my_rentals_desc')}
              to="/my-rentals"
              color={colors.accent}
              colors={colors}
            />
            <StatCard
              icon={<svg className="w-5 h-5" fill="none" stroke="#FF9800" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              value={pendingCount}
              label={t('dashboard.pending')}
              description={t('dashboard.pending_desc')}
              to="/my-rentals"
              color="#FF9800"
              colors={colors}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <h2 className="text-sm uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: colors.primary }}>
            {t('dashboard.recent_activity')}
          </h2>
          <div className="space-y-3">
            {recentRentals.length > 0 ? recentRentals.map((rental) => (
              <div key={rental.id} className="flex items-center justify-between p-4 transition-all"
                style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{
                    backgroundColor: rental.status === 'pending' ? 'var(--status-pending-text)' : rental.status === 'confirmed' ? 'var(--status-accepted-text)' : rental.status === 'cancelled' ? 'var(--status-refused-text)' : colors.accent
                  }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.primary }}>
                      {rental.rental_items?.[0]?.products?.name || `#${rental.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs" style={{ color: colors.textLight }}>
                      {new Date(rental.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 uppercase tracking-wider" style={{
                  backgroundColor: rental.status === 'pending' ? 'var(--status-pending-bg)' : rental.status === 'confirmed' ? 'var(--status-accepted-bg)' : rental.status === 'cancelled' ? 'var(--status-refused-bg)' : colors.accentLight,
                  color: rental.status === 'pending' ? 'var(--status-pending-text)' : rental.status === 'confirmed' ? 'var(--status-accepted-text)' : rental.status === 'cancelled' ? 'var(--status-refused-text)' : colors.accent,
                }}>
                  {t(`rentals.status.${rental.status}`)}
                </span>
              </div>
            )) : (
              <div className="p-8 text-center" style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}>
                <p className="text-sm" style={{ color: colors.textLight }}>
                  {t('dashboard.no_activity')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: colors.primary }}>
            {t('dashboard.quick_actions')}
          </h2>
          <div className="space-y-2">
            {isSupplier ? (
              <>
                <QuickAction
                  icon={<svg className="w-4 h-4" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
                  label={t('dashboard.add_product_btn')}
                  to="/supplier/products/new"
                  colors={colors}
                />
                <QuickAction
                  icon={<svg className="w-4 h-4" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>}
                  label={t('dashboard.view_orders')}
                  to="/supplier/orders"
                  colors={colors}
                />
                <QuickAction
                  icon={<svg className="w-4 h-4" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
                  label={t('dashboard.view_products')}
                  to="/supplier/products"
                  colors={colors}
                />
              </>
            ) : (
              <>
                <QuickAction
                  icon={<svg className="w-4 h-4" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
                  label={t('dashboard.view_catalog_btn')}
                  to="/catalog"
                  colors={colors}
                />
                <QuickAction
                  icon={<svg className="w-4 h-4" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>}
                  label={t('dashboard.view_rentals')}
                  to="/my-rentals"
                  colors={colors}
                />
              </>
            )}
            <QuickAction
              icon={<svg className="w-4 h-4" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
              label={t('dashboard.edit_profile')}
              to="/profile"
              colors={colors}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
