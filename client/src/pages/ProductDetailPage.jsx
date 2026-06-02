import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { fetchProduct } from '../services/productService'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#E0E3E6', borderTopColor: '#76ABAE' }} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841' }}>
          Produit non trouvé
        </h2>
        <Link to="/catalog" className="text-sm mt-4 inline-block" style={{ color: '#76ABAE' }}>
          {t('product.back_to_catalog')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          <Link to="/catalog" style={{ color: '#76ABAE' }}>{t('catalog.title')}</Link>
          <span>/</span>
          {product.categories && <span>{product.categories.name}</span>}
          <span>/</span>
          <span style={{ color: '#303841' }}>{product.name}</span>
        </div>
      </div>

      {/* Product detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="w-full h-80 lg:h-96 flex items-center justify-center" style={{ backgroundColor: '#E8F4F5' }}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-20 h-20" fill="none" stroke="#76ABAE" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div>
            {product.categories && (
              <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                {product.categories.name}
              </p>
            )}
            <h1 className="text-3xl mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}>
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}>
                {product.price_per_day}
              </span>
              <span className="text-sm" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                {t('catalog.currency')} / {t('catalog.price_per_day').toLowerCase()}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-8">
              {product.description && (
                <div>
                  <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {t('product.description')}
                  </span>
                  <p className="text-sm" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {product.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {product.deposit > 0 && (
                  <div>
                    <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {t('product.deposit')}
                    </span>
                    <span className="text-sm" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {product.deposit} {t('catalog.currency')}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {t('product.stock')}
                  </span>
                  <span className="text-sm" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {product.stock} {t('product.stock_unit')}
                  </span>
                </div>
                {product.location && (
                  <div>
                    <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {t('product.location')}
                    </span>
                    <span className="text-sm" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {product.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier info */}
            {product.profiles && (
              <div className="p-4 mb-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E3E6' }}>
                <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {t('product.supplier')}
                </span>
                <p className="text-sm font-medium" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {product.profiles.full_name || 'Fournisseur'}
                </p>
              </div>
            )}

            {/* Book button */}
            <button
              disabled
              className="w-full py-3.5 text-sm uppercase tracking-widest font-medium opacity-70 cursor-not-allowed"
              style={{ backgroundColor: '#FF5722', color: '#FFFFFF', fontFamily: 'DM Sans, system-ui, sans-serif' }}
            >
              {t('product.book')}
            </button>
            <p className="text-xs text-center mt-2" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {t('product.book_coming')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
