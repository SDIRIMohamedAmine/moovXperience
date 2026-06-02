import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../i18n/LanguageContext'
import { useAuth } from '../../hooks/useAuth'
import { fetchMyProducts, deleteProduct } from '../../services/productService'

export default function SupplierProductsPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!session?.access_token) return
    let cancelled = false
    fetchMyProducts(session.access_token)
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

    return () => { cancelled = true }
  }, [session])

  const handleDelete = async (id) => {
    if (!confirm(t('supplier_products.delete_confirm'))) return
    try {
      await deleteProduct(id, session.access_token)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setMessage(t('supplier_products.delete_success'))
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#E0E3E6', borderTopColor: '#76ABAE' }} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('supplier_products.tag')}
          </p>
          <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}>
            {t('supplier_products.title')}
          </h1>
        </div>
        <Link
          to="/supplier/products/new"
          className="px-6 py-2.5 text-sm uppercase tracking-widest font-medium"
          style={{ backgroundColor: '#FF5722', color: '#FFFFFF', fontFamily: 'DM Sans, system-ui, sans-serif' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#E64A19')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#FF5722')}
        >
          {t('supplier_products.add_product')}
        </Link>
      </div>

      {message && (
        <div className="mb-6 p-4 text-sm" style={{ backgroundColor: '#E8F4F5', color: '#303841', border: '1px solid #76ABAE' }}>
          {message}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E3E6' }}>
          <h3 className="text-xl mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}>
            {t('supplier_products.no_products')}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('supplier_products.no_products_desc')}
          </p>
          <Link
            to="/supplier/products/new"
            className="inline-block px-6 py-2.5 text-sm uppercase tracking-widest font-medium"
            style={{ backgroundColor: '#FF5722', color: '#FFFFFF', fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            {t('supplier_products.add_product')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E3E6' }}
            >
              {/* Image placeholder */}
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#E8F4F5' }}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="#76ABAE" strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {product.name}
                </h3>
                <p className="text-xs" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {product.categories?.name || '—'} · {product.price_per_day} {t('catalog.currency')}/{t('catalog.price_per_day').toLowerCase()}
                </p>
              </div>

              {/* Status */}
              <span
                className="text-xs px-2 py-0.5 flex-shrink-0"
                style={{
                  backgroundColor: product.is_available ? '#E8F4F5' : '#FFF3E0',
                  color: product.is_available ? '#76ABAE' : '#E64A19',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                }}
              >
                {product.is_available ? t('catalog.available') : t('catalog.unavailable')}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/supplier/products/${product.id}/edit`}
                  className="text-xs px-3 py-1.5 uppercase tracking-wider"
                  style={{ border: '1px solid #E0E3E6', color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}
                  onMouseEnter={(e) => { e.target.style.borderColor = '#76ABAE'; e.target.style.color = '#76ABAE' }}
                  onMouseLeave={(e) => { e.target.style.borderColor = '#E0E3E6'; e.target.style.color = '#5A6570' }}
                >
                  {t('profile.edit')}
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-xs px-3 py-1.5 uppercase tracking-wider"
                  style={{ border: '1px solid #E0E3E6', color: '#E64A19', fontFamily: 'DM Sans, system-ui, sans-serif' }}
                  onMouseEnter={(e) => { e.target.style.borderColor = '#E64A19'; e.target.style.backgroundColor = '#FFF3E0' }}
                  onMouseLeave={(e) => { e.target.style.borderColor = '#E0E3E6'; e.target.style.backgroundColor = 'transparent' }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
