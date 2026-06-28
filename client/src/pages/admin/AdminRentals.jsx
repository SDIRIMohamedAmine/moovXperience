import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchAllRentals, fetchRentalDetails, updateRentalStatus, deleteRental, isAdminLoggedIn } from '../../services/adminService'
import { showToast } from '../../components/Toast'
import { showConfirm } from '../../components/ConfirmModal'
import { useTranslation } from '../../i18n/LanguageContext'
import { getDateLocale } from '../../lib/locale'

const statusColors = {
  pending: { bg: '#FF9800' },
  confirmed: { bg: '#4CAF50' },
  delivered: { bg: '#7B61FF' },
  returned: { bg: '#AE59CE' },
  completed: { bg: '#4CAF50' },
  cancelled: { bg: '#FF6B6B' },
}

const statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: ['returned'],
  returned: ['completed'],
}

export default function AdminRentals() {
  const { t, lang } = useTranslation()
  const [rentals, setRentals] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('date') // 'date' or 'user'
  const [selectedRental, setSelectedRental] = useState(null)
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setLoading(true)
      fetchAllRentals({ limit: 200 })
        .then((data) => { setRentals(data.rentals); setTotal(data.total) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(getDateLocale(lang), { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const formatDateKey = (d) => d ? new Date(d).toISOString().split('T')[0] : 'unknown'

  const loadDetails = async (id) => {
    if (selectedRental === id) {
      setSelectedRental(null)
      setDetails(null)
      return
    }
    setSelectedRental(id)
    setLoadingDetails(true)
    try {
      const data = await fetchRentalDetails(id)
      setDetails(data)
    } catch (err) {
      showToast(t('admin.error_loading'), 'error')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRentalStatus(id, newStatus)
      setRentals(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      if (details?.id === id) setDetails(prev => ({ ...prev, status: newStatus }))
      showToast(`${t('admin.status_changed')} : ${t(`admin.status_${newStatus}`)}`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = (id) => {
    showConfirm(t('admin.rental_delete_confirm'), async () => {
      try {
        await deleteRental(id)
        setRentals(prev => prev.filter(r => r.id !== id))
        setTotal(prev => prev - 1)
        if (selectedRental === id) { setSelectedRental(null); setDetails(null) }
        showToast(t('admin.rental_deleted'), 'success')
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  }

  // Group rentals
  const grouped = {}
  if (viewMode === 'date') {
    rentals.forEach(r => {
      const key = formatDateKey(r.created_at)
      if (!grouped[key]) grouped[key] = { label: formatDate(r.created_at), items: [] }
      grouped[key].items.push(r)
    })
  } else {
    rentals.forEach(r => {
      const key = r.client_id || 'unknown'
      const name = r.profiles?.full_name || t('admin.no_name')
      if (!grouped[key]) grouped[key] = { label: name, items: [] }
      grouped[key].items.push(r)
    })
  }
  const groups = Object.values(grouped)

  const renderRental = (rental) => {
    const status = statusColors[rental.status] || statusColors.pending
    const transitions = statusTransitions[rental.status] || []
    const isExpanded = selectedRental === rental.id

    return (
      <div key={rental.id} style={{ border: `1px solid ${isExpanded ? 'var(--accent)' : '#1a1a1a'}` }}>
        <div className="p-4 cursor-pointer transition-all hover:bg-[#1a1a1a]"
          onClick={() => loadDetails(rental.id)}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                  #{rental.id.slice(0, 8)}
                </p>
                <span className="text-xs px-2 py-0.5 uppercase tracking-wider font-semibold"
                  style={{ backgroundColor: `${status.bg}20`, color: status.bg, fontSize: '10px' }}>
                  {t(`admin.status_${rental.status}`)}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#666' }}>
                {viewMode === 'date' ? (rental.profiles?.full_name || t('admin.section_client')) : formatDate(rental.created_at)}
                {' · '}{formatDate(rental.start_date)} → {formatDate(rental.end_date)}{' · '}{rental.total_price} TND
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {transitions.map(s => (
                <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusChange(rental.id, s) }}
                  className="text-xs px-3 py-2 sm:py-1.5 uppercase tracking-wider font-medium transition-all"
                  style={{
                    backgroundColor: s === 'cancelled' ? 'rgba(255,107,107,0.1)' : `${statusColors[s]?.bg}20`,
                    color: statusColors[s]?.bg || '#666',
                    border: `1px solid ${statusColors[s]?.bg || '#222'}30`,
                    
                  }}>
                  {s === 'confirmed' ? t('admin.action_accept') : s === 'cancelled' ? t('admin.action_refuse') : s === 'delivered' ? t('admin.action_deliver') : s === 'returned' ? t('admin.action_return') : s === 'completed' ? t('admin.action_complete') : s}
                </button>
              ))}
              <button onClick={(e) => { e.stopPropagation(); handleDelete(rental.id) }}
                className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium"
                style={{ border: '1px solid #FF6B6B30', color: '#FF6B6B' }}>
                {t('admin.delete')}
              </button>
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4" style={{ borderTop: '1px solid #222' }}>
            {loadingDetails ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
              </div>
            ) : details ? (
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: '#666' }}>{t('admin.section_client')}</p>
                    <p className="text-sm" style={{ color: '#FFFFFF' }}>{details.profiles?.full_name || '—'}</p>
                    {details.profiles?.phone && <p className="text-xs" style={{ color: '#888' }}>{details.profiles.phone}</p>}
                  </div>
                </div>

                {details.delivery_address && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: '#666' }}>{t('admin.section_delivery_address')}</p>
                    <p className="text-sm" style={{ color: '#FFFFFF' }}>{typeof details.delivery_address === 'string' ? details.delivery_address : JSON.stringify(details.delivery_address)}</p>
                  </div>
                )}

                {details.notes && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: '#666' }}>{t('admin.section_notes')}</p>
                    <p className="text-sm" style={{ color: '#FFFFFF' }}>{details.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666' }}>
                    {t('admin.section_products')} ({details.rental_items?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {details.rental_items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222' }}>
                        {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-12 h-12 object-cover" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{item.products?.name || t('admin.section_products')}</p>
                          <p className="text-xs" style={{ color: '#666' }}>{t('admin.qty_prefix')} {item.quantity} · {item.price_per_day} TND/j · {item.subtotal} TND</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {statusTransitions[details.status]?.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    {statusTransitions[details.status].map(s => (
                      <button key={s} onClick={() => handleStatusChange(details.id, s)}
                        className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all"
                        style={{
                          background: s === 'cancelled' ? 'linear-gradient(135deg, #FF6B6B, #EE5A5A)' : `linear-gradient(135deg, ${statusColors[s]?.bg}, ${statusColors[s]?.bg}CC)`,
                          color: '#FFFFFF',
                        }}>
                        {s === 'confirmed' ? `✓ ${t('admin.action_accept')}` : s === 'cancelled' ? `✗ ${t('admin.action_refuse')}` : s === 'delivered' ? `🚚 ${t('admin.action_deliver')}` : s === 'returned' ? `📦 ${t('admin.action_return')}` : s === 'completed' ? `✔ ${t('admin.action_complete')}` : s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{  color: '#FFFFFF' }}>
            {t('admin.rentals')} <span className="text-base font-normal" style={{ color: '#666' }}>({total})</span>
          </h1>
        </div>
        <div className="flex" style={{ border: '1px solid #222' }}>
          <button onClick={() => setViewMode('date')}
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'date' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'date' ? '#FFFFFF' : '#666',
              
            }}>
            {t('admin.group_by_date') || 'Par date'}
          </button>
          <button onClick={() => setViewMode('user')}
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'user' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'user' ? '#FFFFFF' : '#666',
              
              borderLeft: '1px solid #222',
            }}>
            {t('admin.group_by_user') || 'Par client'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: '#666' }}>{t('admin.no_rentals')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  {group.label}
                </h2>
                <span className="text-xs px-2 py-0.5" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  {group.items.length}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#222' }} />
              </div>
              {/* Group items */}
              <div className="space-y-2" style={{ backgroundColor: '#141414' }}>
                {group.items.map(renderRental)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
