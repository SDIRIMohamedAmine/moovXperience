import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../hooks/useAuth'
import { useAuthModal } from '../contexts/AuthModalContext'
import { getDateLocale } from '../lib/locale'

export default function CartPage() {
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showLoginModal } = useAuthModal()
  const { items, removeItem, updateQuantity, updateDates, getItemTotal, getTotal } = useCartStore()

  const handleCheckout = () => {
    if (!user) {
      showLoginModal(() => navigate('/checkout'))
      return
    }
    navigate('/checkout')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(getDateLocale(lang), { day: 'numeric', month: 'short' })
  }

  const getDays = (item) => {
    if (!item.startDate || !item.endDate) return 0
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#333" strokeWidth="1" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        <h2 className="text-xl mb-2 font-bold" style={{  color: '#FFFFFF' }}>
          {t('checkout.empty')}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#666' }}>
          {t('rentals.empty_desc')}
        </p>
        <Link to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-semibold"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))', color: '#FFFFFF' }}>
          {t('catalog.title')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl mb-8 font-bold" style={{  color: '#FFFFFF' }}>
        {t('nav.cart')}
        <span className="text-sm ml-3 font-normal" style={{ color: '#666' }}>
          ({items.length} {items.length > 1 ? t('rentals.items') : t('rentals.item')})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const days = getDays(item)
            const total = getItemTotal(item)

            return (
              <div key={item.key} className="p-5 transition-all"
                style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>

                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0" style={{ backgroundColor: '#1a1a1a' }}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="#333" strokeWidth="1" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                          {item.name}
                        </h3>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                          style={{
                            background: item.mode === 'rental' ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'linear-gradient(135deg, var(--accent-tertiary), var(--accent-secondary))',
                            color: '#FFFFFF',
                            
                            fontSize: '10px',
                          }}>
                          {item.mode === 'rental' ? t('rentals.rental') : t('rentals.purchase')}
                        </span>
                      </div>
                      <button onClick={() => removeItem(item.key)}
                        className="p-2.5 transition-colors"
                        style={{ color: '#666' }}
                        onMouseEnter={(e) => (e.target.style.color = '#FF6B6B')}
                        onMouseLeave={(e) => (e.target.style.color = '#666')}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Dates for rental */}
                    {item.mode === 'rental' && (
                      <div className="mt-2 flex items-center gap-2">
                        <input type="date" value={item.startDate || ''} min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => updateDates(item.key, e.target.value, item.endDate)}
                          className="px-2 py-1 text-xs"
                          style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF' }}
                        />
                        <span className="text-xs" style={{ color: '#666' }}>→</span>
                        <input type="date" value={item.endDate || ''} min={item.startDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => updateDates(item.key, item.startDate, e.target.value)}
                          className="px-2 py-1 text-xs"
                          style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF' }}
                        />
                        {days > 0 && (
                          <span className="text-xs" style={{ color: 'var(--accent)' }}>
                            ({days}{t('rentals.days_short')})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Options */}
                    {item.options?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.options.map((opt) => (
                          <span key={opt.name} className="px-2 py-0.5 text-xs"
                            style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--accent-bg)', color: 'var(--accent)' }}>
                            {opt.name} +{opt.price} TND
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quantity + Price */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-sm"
                          style={{ border: '1px solid #222', color: '#FFFFFF' }}>−</button>
                        <span className="w-8 text-center text-sm font-medium" style={{ color: '#FFFFFF' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-sm"
                          style={{ border: '1px solid #222', color: '#FFFFFF' }}>+</button>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                        {total.toFixed(2)} TND
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6" style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
            <h3 className="text-lg font-bold mb-5" style={{ color: '#FFFFFF' }}>
              {t('rentals.summary')}
            </h3>

            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm" style={{  }}>
                  <span style={{ color: '#666' }}>{item.name} × {item.quantity}</span>
                  <span style={{ color: '#FFFFFF' }}>{getItemTotal(item).toFixed(2)} TND</span>
                </div>
              ))}
            </div>

            <div className="pt-4 mb-6" style={{ borderTop: '1px solid #222' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wider" style={{ color: '#666' }}>
                  {t('rentals.total')}
                </span>
                <span className="text-2xl font-bold gradient-text" style={{  }}>
                  {getTotal().toFixed(2)} TND
                </span>
              </div>
            </div>

            <button onClick={handleCheckout}
              className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))', color: '#FFFFFF' }}>
              {t('checkout.confirm')}
            </button>

            <Link to="/catalog" className="block text-center text-xs mt-3 transition-colors"
              style={{ color: '#666' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.target.style.color = '#666')}>
              ← {t('product.back_to_catalog')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
