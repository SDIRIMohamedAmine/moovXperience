import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../hooks/useAuth'
import { getFreshToken } from '../lib/supabase'
import { createRental } from '../services/rentalService'
import { createQuote } from '../services/quoteService'
import LocationPicker from '../components/LocationPicker'
import { showToast } from '../components/Toast'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '../lib/animations'
import { getDateLocale } from '../lib/locale'

export default function CheckoutPage() {
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const { items, getItemTotal, getTotal, clearCart, removeItem, updateQuantity } = useCartStore()
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const total = getTotal()
  const rentalItems = items.filter(i => i.mode === 'rental')
  const purchaseItems = items.filter(i => i.mode === 'purchase')

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl mb-4 font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('checkout.login_required')}
        </h2>
        <Link to="/login" className="text-sm" style={{ color: 'var(--accent)' }}>
          {t('auth.login_title')}
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl mb-4 font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('checkout.empty')}
        </h2>
        <Link to="/catalog" className="text-sm" style={{ color: 'var(--accent)' }}>
          {t('catalog.title')}
        </Link>
      </div>
    )
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      const accessToken = await getFreshToken()
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

      // Create quotes for purchase items
      for (const item of purchaseItems) {
        const optionsTotal = (item.options || []).reduce((sum, opt) => sum + (opt.price || 0), 0)
        const estimatedTotal = (item.price_purchase || item.price_per_day || 0) * item.quantity + optionsTotal
        await createQuote({
          product_id: item.product_id,
          client_name: user.user_metadata?.full_name || user.email,
          client_email: user.email,
          client_phone: user.user_metadata?.phone || '',
          company_name: user.user_metadata?.company_name || '',
          mode: 'purchase',
          duration_days: null,
          options: item.options || [],
          event_date: null,
          event_location: location || null,
          notes: notes || null,
          estimated_total: estimatedTotal,
        }, accessToken)
      }

      clearCart()
      setShowSuccess(true)
      setTimeout(() => navigate('/profile'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(getDateLocale(lang), { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getDays = (item) => {
    if (!item.startDate || !item.endDate) return 0
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }

  const renderItem = (item, showDates) => (
    <div key={item.key} className="p-4 flex items-center gap-3"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Image */}
      <div className="w-12 h-12 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }}>
        {item.images?.[0] ? (
          <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {item.name}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {item.mode === 'rental'
            ? `${item.quantity} × ${item.price_per_day} TND/${t('checkout.day')}${getDays(item) > 0 ? ` × ${getDays(item)} ${t('checkout.days')}` : ''}`
            : `${item.quantity} × ${item.price_purchase || item.price_per_day} TND`
          }
        </div>
        {showDates && item.startDate && item.endDate && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>
            {formatDate(item.startDate)} → {formatDate(item.endDate)}
          </div>
        )}
        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.key, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center text-sm"
            style={{ backgroundColor: 'var(--border)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
          >
            -
          </button>
          <span className="text-sm w-8 text-center" style={{ color: 'var(--text-primary)' }}>
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.key, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-sm"
            style={{ backgroundColor: 'var(--border)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
          >
            +
          </button>
        </div>
      </div>

      {/* Price + Remove */}
      <div className="flex flex-col items-end gap-2">
        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {getItemTotal(item).toFixed(2)} TND
        </div>
        <button
          onClick={() => removeItem(item.key)}
          className="text-xs px-3 py-2"
          style={{ color: '#FF6B6B', border: '1px solid #FF6B6B33' }}
        >
          {t('checkout.remove')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl mb-8 font-bold" style={{ color: 'var(--text-primary)' }}>
        {t('checkout.title')}
      </h1>

      {/* Rental items */}
      {rentalItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: 'var(--accent)' }}>
            {t('checkout.rentals')}
          </h2>
          <div className="space-y-3">
            {rentalItems.map(item => renderItem(item, true))}
          </div>
        </div>
      )}

      {/* Purchase items */}
      {purchaseItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: 'var(--accent-tertiary)' }}>
            {t('checkout.purchases')}
          </h2>
          <div className="space-y-3">
            {purchaseItems.map(item => renderItem(item, false))}
          </div>
        </div>
      )}

      {/* Delivery location */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('checkout.delivery_location')}
        </label>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          {t('checkout.delivery_location_hint')}
        </p>
        <LocationPicker value={location} onChange={setLocation} />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('checkout.notes_label')}
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={t('checkout.notes_placeholder')} rows={3} maxLength={2000}
          className="w-full px-4 py-3 text-sm resize-none"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      {/* Total */}
      <div className="mb-6 p-5 flex items-center justify-between"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('checkout.total')}
        </div>
        <div className="text-2xl font-bold gradient-text">
          {total.toFixed(2)} TND
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3" role="alert"
          style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
          {error}
        </div>
      )}

      <button onClick={handleConfirm} disabled={loading}
        className="w-full py-4 text-sm uppercase tracking-widest font-bold transition-all hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          color: 'var(--text-primary)',
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

      {/* Success popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('checkout.success_heading')}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {t('checkout.success_desc')}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              {t('checkout.redirecting') || 'Redirection vers vos demandes...'}
            </p>
            <div className="w-full h-1 overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <div className="h-full" style={{ background: 'var(--accent-gradient)', animation: 'progressBar 3s linear forwards' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
