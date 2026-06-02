import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { fetchMyProducts } from '../services/productService'

export default function DashboardPage() {
  const { profile, session } = useAuth()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [productCount, setProductCount] = useState(null)

  useEffect(() => {
    if (profile?.role === 'supplier' && session?.access_token) {
      fetchMyProducts(session.access_token)
        .then((data) => setProductCount(data.length))
        .catch(() => setProductCount(0))
    }
  }, [profile, session])

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
      </div>
    )
  }

  const defaultName = profile.role === 'supplier' ? t('dashboard.supplier_default') : t('dashboard.client_default')

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {profile.role === 'supplier' ? t('dashboard.supplier_space') : t('dashboard.client_space')}
        </p>
        <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
          {t('dashboard.welcome')}, {profile.full_name || defaultName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {profile.role === 'supplier' ? (
          <>
            <StatCard colors={colors}
              label={t('dashboard.my_products')}
              value={productCount !== null ? String(productCount) : '—'}
              desc={t('dashboard.my_products_desc')}
              link="/supplier/products"
              linkText={t('dashboard.view_products')}
            />
            <StatCard colors={colors}
              label={t('dashboard.orders')}
              value="0"
              desc={t('dashboard.orders_desc')}
              link="#"
              linkText={t('dashboard.view_orders')}
            />
          </>
        ) : (
          <>
            <StatCard colors={colors}
              label={t('dashboard.my_rentals')}
              value="0"
              desc={t('dashboard.my_rentals_desc')}
              link="#"
              linkText={t('dashboard.view_rentals')}
            />
            <StatCard colors={colors}
              label={t('dashboard.pending')}
              value="0"
              desc={t('dashboard.pending_desc')}
              link="#"
              linkText={t('dashboard.view_details')}
            />
          </>
        )}
      </div>

      <div className="p-6" style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
          {profile.role === 'supplier' ? t('dashboard.add_equipment') : t('dashboard.browse_catalog')}
        </h3>
        <p className="text-sm mb-4" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {profile.role === 'supplier' ? t('dashboard.add_equipment_desc') : t('dashboard.browse_catalog_desc')}
        </p>
        <Link
          to={profile.role === 'supplier' ? '/supplier/products/new' : '/catalog'}
          className="inline-block px-6 py-3 text-sm uppercase tracking-widest font-medium transition-colors"
          style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = colors.ctaHover)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
        >
          {profile.role === 'supplier' ? t('dashboard.add_product_btn') : t('dashboard.view_catalog_btn')}
        </Link>
      </div>
    </div>
  )
}

function StatCard({ colors, label, value, desc, link, linkText }) {
  return (
    <div className="p-6" style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}>
      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        {label}
      </p>
      <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.accent }}>
        {value}
      </div>
      <p className="text-sm mb-4" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        {desc}
      </p>
      <Link to={link} className="text-sm font-medium" style={{ color: colors.accent }}
        onMouseEnter={(e) => (e.target.style.color = colors.primary)}
        onMouseLeave={(e) => (e.target.style.color = colors.accent)}>
        {linkText} →
      </Link>
    </div>
  )
}
