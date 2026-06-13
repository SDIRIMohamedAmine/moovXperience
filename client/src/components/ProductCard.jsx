import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'

export default function ProductCard({ product }) {
  const { t } = useTranslation()

  const modeLabels = {
    rental: t('catalog.mode_rental'),
    sale: t('catalog.mode_sale'),
    both: t('catalog.mode_both'),
  }
  const modeLabel = modeLabels[product.mode] || modeLabels.rental

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden transition-all duration-500"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = 'var(--shadow-accent)'
        e.currentTarget.style.transform = 'translateY(-6px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image — responsive aspect ratio */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/2', backgroundColor: 'var(--bg-elevated)' }}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16" fill="none" stroke="var(--border-light)" strokeWidth="0.8" viewBox="0 0 24 24" role="img" aria-label="No image available">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{ background: 'linear-gradient(to top, var(--bg) 0%, transparent 50%)' }} />

        {/* Price badge — bottom right over image */}
        {product.pricing_type !== 'suggestion' && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              {product.price_per_day} {t('catalog.currency')}
            </span>
            <span className="text-xs ml-1" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-muted)' }}>
              / {t('catalog.price_per_day').toLowerCase()}
            </span>
          </div>
        )}
        {product.pricing_type === 'suggestion' && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent-tertiary)' }}>
            <span className="text-xs font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--accent-tertiary)' }}>
              {t('catalog.suggest_price')}
            </span>
          </div>
        )}

        {/* Mode badge — top right */}
        <div className="absolute top-3 right-3 px-2.5 py-1"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
            {modeLabel}
          </span>
        </div>

        {/* Video indicator — top left */}
        {product.video_url && (
          <div className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <span className="px-6 py-2.5 text-xs uppercase tracking-widest font-semibold backdrop-blur-sm"
            style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', fontFamily: 'Outfit, sans-serif' }}>
            {t('product.view_details')}
          </span>
        </div>

        {/* Availability dot */}
        <div className="absolute top-3 left-12 flex items-center gap-1.5 px-2 py-1 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.is_available ? '#4CAF50' : '#FF9800' }} />
          <span className="text-xs font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
            {product.is_available ? t('catalog.available') : t('catalog.unavailable')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.categories && (
          <span className="text-xs uppercase tracking-[0.2em] mb-2 block font-semibold"
            style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
            {product.categories.name}
          </span>
        )}

        {/* Name */}
        <h3 className="text-lg mb-2 leading-tight font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
          {product.name}
        </h3>

        {/* Rating */}
        {product.product_ratings?.[0] && (
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="12" height="12" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
              {product.product_ratings[0].avg_rating} ({product.product_ratings[0].review_count})
            </span>
          </div>
        )}

        {/* Price info */}
        <div className="mt-1">
          {product.pricing_type === 'suggestion' ? (
            <p className="text-xs font-medium" style={{ color: 'var(--accent-tertiary)', fontFamily: 'Outfit, sans-serif' }}>
              {t('catalog.suggest_price')}
            </p>
          ) : product.pricing_type === 'negotiable' ? (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
                {product.price_per_day} {t('catalog.currency')}/{t('catalog.price_per_day').toLowerCase()}
              </p>
              <span className="text-xs px-1.5 py-0.5" style={{ backgroundColor: 'rgba(255,152,0,0.15)', color: '#FF9800', fontFamily: 'Outfit, sans-serif', fontSize: '9px' }}>
                {t('catalog.negotiable')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
                {product.price_per_day} {t('catalog.currency')}/{t('catalog.price_per_day').toLowerCase()}
              </p>
              {product.price_purchase && (product.mode === 'sale' || product.mode === 'both') && (
                <p className="text-sm font-bold" style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
                  {product.price_purchase} {t('catalog.currency')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        {product.location && (
          <p className="text-xs flex items-center gap-1 mt-2" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {product.location}
          </p>
        )}
      </div>
    </Link>
  )
}
