import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { getFreshToken } from '../lib/supabase'
import { useTheme } from '../theme/ThemeContext'
import { fetchMyRentals, updateRentalStatus } from '../services/rentalService'
import { initiatePayment } from '../services/paymentService'
import { showToast } from '../components/Toast'
import { showConfirm } from '../components/ConfirmModal'

const STATUS_COLORS = {
  pending: { bg: '#FFF8E1', text: '#F57F17' },
  confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  delivered: { bg: '#E3F2FD', text: '#1565C0' },
  returned: { bg: '#F3E5F5', text: '#7B1FA2' },
  completed: { bg: '#E8F5E9', text: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
}

const PAYMENT_COLORS = {
  pending: { bg: '#FFF8E1', text: '#F57F17' },
  paid: { bg: '#E8F5E9', text: '#2E7D32' },
  failed: { bg: '#FFEBEE', text: '#C62828' },
  refunded: { bg: '#E3F2FD', text: '#1565C0' },
}

export default function MyRentalsPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const { colors } = useTheme()
  const location = useLocation()
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [success, setSuccess] = useState(location.state?.success || false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getFreshToken().then(token => {
      if (cancelled || !token) {
        if (!cancelled) setLoading(false)
        return
      }
      const status = filter === 'all' ? undefined : filter
      fetchMyRentals(token, status)
        .then((data) => { if (!cancelled) setRentals(data) })
        .catch(console.error)
        .finally(() => { if (!cancelled) setLoading(false) })
    })

    return () => { cancelled = true }
  }, [filter, refreshKey])

  async function handleCancel(id) {
    showConfirm(t('rentals.confirm_cancel'), async () => {
      try {
        const token = await getFreshToken()
        await updateRentalStatus(id, 'cancelled', token)
        setRefreshKey(k => k + 1)
        showToast(t('rentals.cancel_success'), 'success')
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  }

  async function handlePay(rentalId) {
    try {
      const { payUrl } = await initiatePayment(rentalId, session.access_token)
      // Validate URL is from Konnect before redirecting
      if (payUrl && (payUrl.startsWith('https://api.sandbox.konnect.network') || payUrl.startsWith('https://api.konnect.network') || payUrl.startsWith('https://konnect.network'))) {
        window.location.href = payUrl
      } else {
        showToast(t('payment.error_desc'), 'error')
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const statusTabs = ['all', 'pending', 'confirmed', 'delivered', 'completed', 'cancelled']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary }}>
        {t('rentals.title')}
      </h1>

      {success && (
        <div className="mb-4 text-sm px-4 py-3" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('rentals.booking_success')}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusTabs.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="px-3 py-1.5 text-xs whitespace-nowrap transition-colors"
            style={{
              backgroundColor: filter === status ? colors.primary : colors.bg,
              color: filter === status ? colors.textWhite : colors.primary,
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontWeight: 500,
            }}
          >
            {t(`rentals.status.${status}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
        </div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm mb-4" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('rentals.empty')}
          </p>
          <Link to="/catalog" className="text-sm" style={{ color: colors.accent }}>
            {t('rentals.browse_catalog')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map(rental => (
            <div
              key={rental.id}
              className="overflow-hidden"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgWhite }}
            >
              <div className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: STATUS_COLORS[rental.status]?.bg || colors.bg,
                        color: STATUS_COLORS[rental.status]?.text || colors.primary,
                        fontFamily: 'DM Sans, system-ui, sans-serif',
                      }}
                    >
                      {t(`rentals.status.${rental.status}`)}
                    </span>
                    {rental.payment_status && rental.payment_status !== 'pending' && (
                      <span
                        className="px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: PAYMENT_COLORS[rental.payment_status]?.bg || colors.bg,
                          color: PAYMENT_COLORS[rental.payment_status]?.text || colors.primary,
                          fontFamily: 'DM Sans, system-ui, sans-serif',
                        }}
                      >
                        {t(`payment.status.${rental.payment_status}`)}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {formatDate(rental.start_date)} — {formatDate(rental.end_date)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {(rental.rental_items || []).map(item => (
                      <div key={item.id} className="text-sm" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                        {item.products?.name || 'Produit'} × {item.quantity}
                      </div>
                    ))}
                  </div>

                  {rental.notes && (
                    <p className="text-xs mt-2" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {rental.notes}
                    </p>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm font-bold" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {Number(rental.total_price).toFixed(2)} TND
                  </div>
                </div>
              </div>

              {rental.status === 'pending' && (
                <div className="px-4 py-3 flex justify-end" style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
                  <button
                    onClick={() => handleCancel(rental.id)}
                    className="px-4 py-1.5 text-xs font-medium"
                    style={{ backgroundColor: '#FFEBEE', color: '#C62828', fontFamily: 'DM Sans, system-ui, sans-serif' }}
                  >
                    {t('rentals.cancel')}
                  </button>
                </div>
              )}

              {rental.status === 'confirmed' && rental.payment_status === 'pending' && (
                <div className="px-4 py-3 flex justify-end gap-2" style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
                  <button
                    onClick={() => handlePay(rental.id)}
                    className="px-5 py-1.5 text-xs font-medium"
                    style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                  >
                    {t('payment.pay_now')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
