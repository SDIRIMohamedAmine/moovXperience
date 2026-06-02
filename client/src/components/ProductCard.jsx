import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'

export default function ProductCard({ product }) {
  const { t } = useTranslation()

  return (
    <Link
      to={`/products/${product.id}`}
      className="block transition-all duration-300"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E3E6' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#76ABAE'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(118,171,174,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E0E3E6'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Image placeholder */}
      <div
        className="w-full h-48 flex items-center justify-center"
        style={{ backgroundColor: '#E8F4F5' }}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12" fill="none" stroke="#76ABAE" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
          </svg>
        )}
      </div>

      <div className="p-4">
        {/* Category badge */}
        {product.categories && (
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            {product.categories.name}
          </span>
        )}

        {/* Name */}
        <h3
          className="text-lg mt-1 mb-2"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span
            className="text-xl"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}
          >
            {product.price_per_day}
          </span>
          <span
            className="text-xs"
            style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            {t('catalog.currency')} / {t('catalog.price_per_day').toLowerCase()}
          </span>
        </div>

        {/* Availability */}
        <div className="mt-2">
          <span
            className="text-xs px-2 py-0.5"
            style={{
              backgroundColor: product.is_available ? '#E8F4F5' : '#FFF3E0',
              color: product.is_available ? '#76ABAE' : '#E64A19',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            }}
          >
            {product.is_available ? t('catalog.available') : t('catalog.unavailable')}
          </span>
        </div>
      </div>
    </Link>
  )
}
