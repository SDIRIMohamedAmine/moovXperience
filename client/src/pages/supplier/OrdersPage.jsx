import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../theme/ThemeContext'
import { fetchMyRentals, updateRentalStatus } from '../../services/rentalService'
import { showToast } from '../../components/Toast'
import { showConfirm } from '../../components/ConfirmModal'

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

export default function OrdersPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const { colors } = useTheme()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false) // eslint-disable-line react-hooks/set-state-in-effect
      return
    }

    let cancelled = false
    setLoading(true)
    const status = filter === 'all' ? undefined : filter
    fetchMyRentals(session.access_token, status)
      .then((data) => { if (!cancelled) setOrders(data) })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filter, refreshKey, session])

  async function handleStatus(id, newStatus) {
    const labels = {
      confirmed: t('orders.action_confirm'),
      delivered: t('orders.action_deliver'),
      returned: t('orders.action_return'),
      cancelled: t('orders.action_reject'),
    }
    showConfirm(`${labels[newStatus] || newStatus}?`, async () => {
      try {
        await updateRentalStatus(id, newStatus, session.access_token)
        setRefreshKey(k => k + 1)
        showToast(t('orders.status_updated'), 'success')
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const statusTabs = ['all', 'pending', 'confirmed', 'delivered', 'returned', 'completed', 'cancelled']

  const getActions = (order) => {
    switch (order.status) {
      case 'pending':
        return [
          { label: t('orders.action_confirm'), status: 'confirmed', style: { backgroundColor: '#E8F5E9', color: '#2E7D32' } },
          { label: t('orders.action_reject'), status: 'cancelled', style: { backgroundColor: '#FFEBEE', color: '#C62828' } },
        ]
      case 'confirmed':
        return [
          { label: t('orders.action_deliver'), status: 'delivered', style: { backgroundColor: '#E3F2FD', color: '#1565C0' } },
        ]
      case 'delivered':
        return [
          { label: t('orders.action_return'), status: 'returned', style: { backgroundColor: '#F3E5F5', color: '#7B1FA2' } },
        ]
      case 'returned':
        return [
          { label: t('orders.action_complete'), status: 'completed', style: { backgroundColor: '#E8F5E9', color: '#2E7D32' } },
        ]
      default:
        return []
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary }}>
        {t('orders.title')}
      </h1>

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
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('orders.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="overflow-hidden"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgWhite }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: STATUS_COLORS[order.status]?.bg || colors.bg,
                        color: STATUS_COLORS[order.status]?.text || colors.primary,
                        fontFamily: 'DM Sans, system-ui, sans-serif',
                      }}
                    >
                      {t(`rentals.status.${order.status}`)}
                    </span>
                    {order.payment_status && order.payment_status !== 'pending' && (
                      <span
                        className="px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: PAYMENT_COLORS[order.payment_status]?.bg || colors.bg,
                          color: PAYMENT_COLORS[order.payment_status]?.text || colors.primary,
                          fontFamily: 'DM Sans, system-ui, sans-serif',
                        }}
                      >
                        {t(`payment.status.${order.payment_status}`)}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {formatDate(order.start_date)} — {formatDate(order.end_date)}
                    </span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {Number(order.total_price).toFixed(2)} TND
                  </div>
                </div>

                {/* Client info */}
                {order.profiles && (
                  <div className="mb-3 px-3 py-2" style={{ backgroundColor: colors.bg }}>
                    <span className="text-xs" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {t('orders.client')}: {' '}
                    </span>
                    <span className="text-sm font-medium" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {order.profiles.full_name || '—'}
                    </span>
                    {order.profiles.phone && (
                      <span className="text-xs ml-2" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                        {order.profiles.phone}
                      </span>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                  {(order.rental_items || []).map(item => (
                    <div key={item.id} className="text-sm" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {item.products?.name || 'Produit'} × {item.quantity}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="text-xs mt-2" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                    {t('orders.note')}: {order.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              {getActions(order).length > 0 && (
                <div className="px-4 py-3 flex justify-end gap-2" style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
                  {getActions(order).map(action => (
                    <button
                      key={action.status}
                      onClick={() => handleStatus(order.id, action.status)}
                      className="px-4 py-1.5 text-xs font-medium"
                      style={{ ...action.style, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
