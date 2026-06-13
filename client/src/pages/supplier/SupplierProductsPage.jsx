import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { getFreshToken } from '../../lib/supabase'
import { fetchMyProducts, deleteProduct } from '../../services/productService'
import { showToast } from '../../components/Toast'
import { showConfirm } from '../../components/ConfirmModal'

const modeLabels = {
  rental: { label: 'Location', color: '#76ABAE' },
  sale: { label: 'Achat', color: '#FF5722' },
  both: { label: 'Loc + Achat', color: '#303841' },
}

export default function SupplierProductsPage() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { session } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getFreshToken().then(token => {
      if (cancelled || !token) return
    fetchMyProducts(token)
      .then((data) => {
        if (!cancelled) {
          setProducts(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err)
          setLoading(false)
        }
      })
    })

    return () => { cancelled = true }
  }, [])

  const handleDelete = async (id) => {
    showConfirm(t('supplier_products.delete_confirm'), async () => {
      try {
        await deleteProduct(id, session.access_token)
        setProducts((prev) => prev.filter((p) => p.id !== id))
        showToast(t('supplier_products.delete_success'), 'success')
      } catch (err) {
        showToast(err.message || t('common.error'), 'error')
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('supplier_products.tag')}
          </p>
          <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
            {t('supplier_products.title')}
          </h1>
        </div>
        <Link
          to="/supplier/products/new"
          className="px-6 py-2.5 text-sm uppercase tracking-widest font-medium"
          style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = colors.ctaHover)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
        >
          {t('supplier_products.add_product')}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16" style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}>
          <h3 className="text-xl mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
            {t('supplier_products.no_products')}
          </h3>
          <p className="text-sm mb-6" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('supplier_products.no_products_desc')}
          </p>
          <Link
            to="/supplier/products/new"
            className="inline-block px-6 py-2.5 text-sm uppercase tracking-widest font-medium"
            style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            {t('supplier_products.add_product')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const mode = modeLabels[product.mode] || modeLabels.rental
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 transition-all"
                style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border }}
              >
                {/* Image */}
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: colors.accentLight }}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke={colors.accent} strokeWidth="1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium truncate" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {product.name}
                    </h3>
                    {product.video_url && (
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill={colors.accent} viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {product.categories?.name || '—'} · {product.price_per_day} {t('catalog.currency')}/{t('catalog.price_per_day').toLowerCase()}
                    {product.price_purchase && (product.mode === 'sale' || product.mode === 'both')
                      ? ` · ${product.price_purchase} ${t('catalog.currency')} achat`
                      : ''}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    Stock: {product.stock} · Min: {product.min_duration || 1}j
                  </p>
                </div>

                {/* Mode badge */}
                <span className="text-xs px-2.5 py-1 flex-shrink-0"
                  style={{ backgroundColor: mode.color, color: '#fff', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {mode.label}
                </span>

                {/* Status */}
                <span className="text-xs px-2 py-0.5 flex-shrink-0"
                  style={{
                    backgroundColor: product.is_available ? colors.accentLight : '#FFF3E0',
                    color: product.is_available ? colors.accent : '#E64A19',
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                  }}>
                  {product.is_available ? t('catalog.available') : t('catalog.unavailable')}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/supplier/products/${product.id}/edit`}
                    className="text-xs px-3 py-1.5 uppercase tracking-wider transition-colors"
                    style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                    onMouseEnter={(e) => { e.target.style.borderColor = colors.accent; e.target.style.color = colors.accent }}
                    onMouseLeave={(e) => { e.target.style.borderColor = colors.border; e.target.style.color = colors.textSecondary }}
                  >
                    {t('profile.edit')}
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-xs px-3 py-1.5 uppercase tracking-wider transition-colors"
                    style={{ border: `1px solid ${colors.border}`, color: '#E64A19', fontFamily: 'DM Sans, system-ui, sans-serif' }}
                    onMouseEnter={(e) => { e.target.style.borderColor = '#E64A19'; e.target.style.backgroundColor = '#FFF3E0' }}
                    onMouseLeave={(e) => { e.target.style.borderColor = colors.border; e.target.style.backgroundColor = 'transparent' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
