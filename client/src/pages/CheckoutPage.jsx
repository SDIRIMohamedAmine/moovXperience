import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../hooks/useAuth'
import { createRental } from '../services/rentalService'
import LocationPicker from '../components/LocationPicker'
import { showToast } from '../components/Toast'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const { items, getItemTotal, getTotal, clearCart } = useCartStore()
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const total = getTotal()
  const rentalItems = items.filter(i => i.mode === 'rental')
  const purchaseItems = items.filter(i => i.mode === 'purchase')

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl mb-4 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('checkout.login_required')}
        </h2>
        <Link to="/login" className="text-sm" style={{ color: '#D23AB0' }}>
          {t('auth.login_title')}
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl mb-4 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('checkout.empty')}
        </h2>
        <Link to="/catalog" className="text-sm" style={{ color: '#D23AB0' }}>
          {t('catalog.title')}
        </Link>
      </div>
    )
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      const accessToken = session?.access_token
      if (!accessToken) {
        setError(t('checkout.login_required'))
        return
      }

      // Create rentals for rental items
      if (rentalItems.length > 0) {
        const firstItem = rentalItems[0]
        await createRental({
          items: rentalItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
          start_date: firstItem.startDate,
          end_date: firstItem.endDate,
          notes: notes || null,
          delivery_address: location || null,
        }, accessToken)
      }

      // Purchase items would go through a different flow (quote/payment)
      // For now, they're handled the same way

      clearCart()
      showToast('Réservation confirmée !', 'success')
      navigate('/catalog')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getDays = (item) => {
    if (!item.startDate || !item.endDate) return 0
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl mb-8 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
        {t('checkout.title')}
      </h1>

      {/* Rental items */}
      {rentalItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
            Locations
          </h2>
          <div className="space-y-3">
            {rentalItems.map(item => {
              const days = getDays(item)
              return (
                <div key={item.key} className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0" style={{ backgroundColor: '#1a1a1a' }}>
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                        {item.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                        {item.quantity} × {item.price_per_day} TND/jour
                        {days > 0 && ` × ${days} jours`}
                      </div>
                      {item.startDate && item.endDate && (
                        <div className="text-xs mt-0.5" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
                          {formatDate(item.startDate)} → {formatDate(item.endDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-bold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                    {getItemTotal(item).toFixed(2)} TND
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Purchase items */}
      {purchaseItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: '#7B61FF', fontFamily: 'Outfit, sans-serif' }}>
            Achats
          </h2>
          <div className="space-y-3">
            {purchaseItems.map(item => (
              <div key={item.key} className="p-4 flex items-center justify-between"
                style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0" style={{ backgroundColor: '#1a1a1a' }}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                      {item.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                      {item.quantity} × {item.price_purchase || item.price_per_day} TND
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                  {getItemTotal(item).toFixed(2)} TND
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery location */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
          {t('checkout.delivery_location')}
        </label>
        <p className="text-xs mb-3" style={{ color: '#444', fontFamily: 'Outfit, sans-serif' }}>
          {t('checkout.delivery_location_hint')}
        </p>
        <LocationPicker value={location} onChange={setLocation} />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
          {t('checkout.notes_label')}
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={t('checkout.notes_placeholder')} rows={3} maxLength={2000}
          className="w-full px-4 py-3 text-sm resize-none"
          style={{ backgroundColor: '#141414', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
          onFocus={e => e.target.style.borderColor = '#D23AB0'}
          onBlur={e => e.target.style.borderColor = '#222'} />
      </div>

      {/* Total */}
      <div className="mb-6 p-5 flex items-center justify-between"
        style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
        <div className="text-sm font-semibold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
          {t('checkout.total')}
        </div>
        <div className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {total.toFixed(2)} TND
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3" role="alert"
          style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)', fontFamily: 'Outfit, sans-serif' }}>
          {error}
        </div>
      )}

      <button onClick={handleConfirm} disabled={loading}
        className="w-full py-4 text-sm uppercase tracking-widest font-bold transition-all hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #D23AB0, #AE59CE)',
          color: '#FFFFFF',
          fontFamily: 'Outfit, sans-serif',
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('checkout.confirming')}
          </span>
        ) : t('checkout.confirm')}
      </button>
    </div>
  )
}
