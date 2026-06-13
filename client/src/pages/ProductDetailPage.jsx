import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../hooks/useAuth'
import { useAuthModal } from '../contexts/AuthModalContext'
import { fetchProduct } from '../services/productService'
import DateRangePicker from '../components/DateRangePicker'
import ReviewList, { StarDisplay } from '../components/ReviewList'
import { showToast } from '../components/Toast'
import Lightbox from '../components/Lightbox'

function getYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showLoginModal } = useAuthModal()
  const addItem = useCartStore(state => state.addItem)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMode, setSelectedMode] = useState('rental')
  const [selectedRange, setSelectedRange] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('gallery')
  const [selectedOptions, setSelectedOptions] = useState({})
  const [suggestedPrice, setSuggestedPrice] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    fetchProduct(id)
      .then((p) => {
        setProduct(p)
        // Default mode based on product
        if (p.mode === 'sale' && p.mode !== 'both') setSelectedMode('purchase')
        else setSelectedMode('rental')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('product.not_found')}
        </h2>
        <Link to="/catalog" className="text-sm mt-4 inline-block" style={{ color: 'var(--accent)' }}>
          {t('product.back_to_catalog')}
        </Link>
      </div>
    )
  }

  const images = product.images || []
  const hasImages = images.length > 0
  const hasVideo = !!product.video_url
  const videoId = getYouTubeId(product.video_url)
  const options = product.options || []
  const canPurchase = product.mode === 'sale' || product.mode === 'both'
  const canRent = product.mode === 'rental' || product.mode === 'both'

  const handlePrev = () => setActiveImage(i => i === 0 ? images.length - 1 : i - 1)
  const handleNext = () => setActiveImage(i => i === images.length - 1 ? 0 : i + 1)

  const toggleOption = (optName) => {
    setSelectedOptions(prev => ({ ...prev, [optName]: !prev[optName] }))
  }

  const selectedOptsList = options.filter(opt => selectedOptions[opt.name]).map(opt => ({ name: opt.name, price: opt.price }))

  const handleAddToCart = () => {
    // For rental, dates are required
    if (selectedMode === 'rental' && (!selectedRange?.from || !selectedRange?.to)) {
      showToast(t('product.dates_required'), 'error')
      return
    }

    const startDate = selectedMode === 'rental' ? selectedRange.from.toISOString().split('T')[0] : null
    const endDate = selectedMode === 'rental' ? selectedRange.to.toISOString().split('T')[0] : null

    addItem(product, quantity, selectedMode, startDate, endDate, selectedOptsList)
    showToast(t('product.added_to_cart'), 'success')
  }

  return (
    <div style={{ backgroundColor: '#0D0D0D' }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
          <Link to="/catalog" style={{ color: 'var(--accent)' }}>{t('catalog.title')}</Link>
          <span>/</span>
          {product.categories && <span>{product.categories.name}</span>}
          <span>/</span>
          <span style={{ color: '#FFFFFF' }}>{product.name}</span>
        </div>
      </div>

      {/* Product detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Media gallery */}
          <div>
            <div className="flex gap-1 mb-3">
              <button onClick={() => setActiveTab('gallery')}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'gallery' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'gallery' ? '#FFFFFF' : '#666',
                  border: `1px solid ${activeTab === 'gallery' ? 'var(--accent)' : '#222'}`,
                  fontFamily: 'Outfit, sans-serif',
                }}>
                {t('product.gallery')}
              </button>
              {hasVideo && (
                <button onClick={() => setActiveTab('video')}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-1.5"
                  style={{
                    backgroundColor: activeTab === 'video' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'video' ? '#FFFFFF' : '#666',
                    border: `1px solid ${activeTab === 'video' ? 'var(--accent)' : '#222'}`,
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {t('product.video')}
                </button>
              )}
            </div>

            {activeTab === 'gallery' && (
              <>
                <div className="relative w-full h-80 lg:h-[480px] flex items-center justify-center overflow-hidden group cursor-pointer"
                  style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}
                  onClick={() => hasImages && setLightboxIndex(activeImage)}>
                  {hasImages ? (
                    <>
                      {images[activeImage].match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={images[activeImage]} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={images[activeImage]} alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      )}
                      {/* Zoom icon */}
                      <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <svg className="w-20 h-20" fill="none" stroke="#333" strokeWidth="1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                    </svg>
                  )}
                  {images.length > 1 && (
                    <>
                      <button onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', borderRadius: '50%' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', borderRadius: '50%' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 text-xs backdrop-blur-sm"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                        {activeImage + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImage(i)}
                        className="flex-shrink-0 w-16 h-16 overflow-hidden transition-all"
                        style={{ border: `2px solid ${i === activeImage ? 'var(--accent)' : '#1a1a1a'}`, opacity: i === activeImage ? 1 : 0.5 }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'video' && hasVideo && (
              <div className="relative w-full" style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
                {videoId ? (
                  <iframe src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title={product.name} />
                ) : (
                  <video src={product.video_url} controls className="absolute inset-0 w-full h-full object-contain" />
                )}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div>
            {/* Category */}
            {product.categories && (
              <p className="text-xs uppercase tracking-[0.25em] mb-2 font-semibold"
                style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
                {product.categories.name}
              </p>
            )}
            <h1 className="text-3xl mb-3 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.product_ratings?.[0] && (
              <div className="flex items-center gap-2 mb-5">
                <StarDisplay rating={Math.round(product.product_ratings[0].avg_rating)} size={14} />
                <span className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                  {product.product_ratings[0].avg_rating}
                </span>
                <span className="text-xs" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  ({product.product_ratings[0].review_count} {t('reviews.reviews')})
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#A0A0A0', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                {product.description}
              </p>
            )}

            {/* Mode selector — Buy or Rent */}
            {(canRent || canPurchase) && (
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider mb-3 font-semibold"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {t('product.mode')}
                </label>
                <div className="flex gap-3">
                  {canRent && (
                    <button onClick={() => setSelectedMode('rental')}
                      className="flex-1 p-4 text-left transition-all"
                      style={{
                        backgroundColor: selectedMode === 'rental' ? 'var(--accent-bg)' : '#141414',
                        border: `2px solid ${selectedMode === 'rental' ? 'var(--accent)' : '#1a1a1a'}`,
                      }}>
                      <div className="text-sm font-bold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                        {t('quote.rental')}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                        {product.price_per_day} TND/{t('catalog.price_per_day').toLowerCase()}
                      </div>
                    </button>
                  )}
                  {canPurchase && (
                    <button onClick={() => setSelectedMode('purchase')}
                      className="flex-1 p-4 text-left transition-all"
                      style={{
                        backgroundColor: selectedMode === 'purchase' ? 'var(--accent-bg)' : '#141414',
                        border: `2px solid ${selectedMode === 'purchase' ? 'var(--accent)' : '#1a1a1a'}`,
                      }}>
                      <div className="text-sm font-bold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                        {t('quote.purchase')}
                      </div>
                      {product.price_purchase && (
                        <div className="text-xs mt-1" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                          {product.price_purchase} TND
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Date picker — only for rental */}
            {selectedMode === 'rental' && (
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {t('product.select_dates')}
                </label>
                <DateRangePicker productId={product.id} selectedRange={selectedRange} onSelect={setSelectedRange} />
              </div>
            )}

            {/* Options */}
            {options.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider mb-3 font-semibold"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {t('product.customization')}
                </label>
                <div className="space-y-2">
                  {options.map((opt) => (
                    <label key={opt.name}
                      className="flex items-start gap-3 p-3 cursor-pointer transition-all"
                      style={{
                        backgroundColor: selectedOptions[opt.name] ? 'var(--accent-bg)' : '#141414',
                        border: `1px solid ${selectedOptions[opt.name] ? 'var(--accent)' : '#1a1a1a'}`,
                      }}>
                      <input type="checkbox" checked={!!selectedOptions[opt.name]} onChange={() => toggleOption(opt.name)}
                        className="mt-0.5 accent-[var(--accent)]" />
                      <div className="flex-1">
                        <span className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                          {opt.name}
                        </span>
                        {opt.description && (
                          <p className="text-xs mt-0.5" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                            {opt.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
                        +{opt.price} TND
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                {t('product.quantity')}
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-sm font-bold"
                  style={{ border: '1px solid #222', color: '#FFFFFF' }}>−</button>
                <span className="w-9 text-center text-sm font-bold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                  {quantity}
                </span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-sm font-bold"
                  style={{ border: '1px solid #222', color: '#FFFFFF' }}>+</button>
                <span className="text-xs" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {product.stock} {t('product.available')}
                </span>
              </div>
            </div>

            {/* Pricing type badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider font-semibold"
                style={{
                  background: product.pricing_type === 'fixed' ? 'rgba(76,175,80,0.15)' : product.pricing_type === 'negotiable' ? 'rgba(255,152,0,0.15)' : 'rgba(123,97,255,0.15)',
                  color: product.pricing_type === 'fixed' ? '#4CAF50' : product.pricing_type === 'negotiable' ? '#FF9800' : 'var(--accent-tertiary)',
                  border: `1px solid ${product.pricing_type === 'fixed' ? 'rgba(76,175,80,0.3)' : product.pricing_type === 'negotiable' ? 'rgba(255,152,0,0.3)' : 'rgba(123,97,255,0.3)'}`,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '10px',
                }}>
                {product.pricing_type === 'fixed' ? t('product.pricing_fixed') : product.pricing_type === 'negotiable' ? t('product.pricing_negotiable') : t('product.pricing_suggestion')}
              </span>
            </div>

            {/* Price display */}
            <div className="mb-6 p-4" style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
              {product.pricing_type === 'suggestion' ? (
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: 'var(--accent-tertiary)', fontFamily: 'Outfit, sans-serif' }}>
                    {t('product.suggest_price_hint')}
                  </p>
                  <input type="number" value={suggestedPrice} onChange={(e) => setSuggestedPrice(e.target.value)}
                    placeholder={t('product.suggest_price_placeholder')} min="0" step="0.01"
                    className="w-full px-4 py-3 text-sm"
                    style={{ backgroundColor: '#0D0D0D', border: '1px solid var(--accent-tertiary)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }} />
                </div>
              ) : selectedMode === 'rental' ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {product.price_per_day}
                  </span>
                  <span className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                    {t('product.per_day')} × {quantity}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {product.price_purchase || product.price_per_day}
                  </span>
                  <span className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                    TND × {quantity}
                  </span>
                </div>
              )}
            </div>

            {/* Add to Cart button */}
            <button onClick={handleAddToCart}
              className="w-full py-4 text-sm uppercase tracking-widest font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {t('product.add_to_cart')}
            </button>

            {/* Supplier info */}
            {product.profiles && (
              <div className="mt-5 p-4" style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
                <span className="text-xs uppercase tracking-wider block mb-2 font-semibold"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {t('product.supplier')}
                </span>
                <p className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                  {product.profiles.full_name || 'Maker Skills'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-xl mb-6 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
            {t('reviews.title')}
          </h2>
          <ReviewList productId={product.id} />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          files={images.map(url => ({
            url,
            type: url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image',
          }))}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
