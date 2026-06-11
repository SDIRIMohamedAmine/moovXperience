import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchAllRentals, fetchRentalDetails, updateRentalStatus, deleteRental, isAdminLoggedIn } from '../../services/adminService'
import { showToast } from '../../components/Toast'
import { showConfirm } from '../../components/ConfirmModal'

const statusColors = {
  pending: { bg: '#FF9800', label: 'En attente' },
  confirmed: { bg: '#4CAF50', label: 'Confirmée' },
  delivered: { bg: '#7B61FF', label: 'Livrée' },
  returned: { bg: '#AE59CE', label: 'Retournée' },
  completed: { bg: '#4CAF50', label: 'Terminée' },
  cancelled: { bg: '#FF6B6B', label: 'Annulée' },
}

const statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: ['returned'],
  returned: ['completed'],
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selectedRental, setSelectedRental] = useState(null)
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setLoading(true)
      fetchAllRentals({ status: filter || undefined })
        .then((data) => { setRentals(data.rentals); setTotal(data.total) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [filter])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

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
      showToast('Erreur chargement détails', 'error')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRentalStatus(id, newStatus)
      setRentals(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      if (details?.id === id) {
        setDetails(prev => ({ ...prev, status: newStatus }))
      }
      showToast(`Statut changé : ${statusColors[newStatus]?.label}`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = (id) => {
    showConfirm('Supprimer cette réservation ?', async () => {
      try {
        await deleteRental(id)
        setRentals(prev => prev.filter(r => r.id !== id))
        setTotal(prev => prev - 1)
        if (selectedRental === id) {
          setSelectedRental(null)
          setDetails(null)
        }
        showToast('Réservation supprimée', 'success')
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
          Administration
        </p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          Réservations <span className="text-lg font-normal" style={{ color: '#666' }}>({total})</span>
        </h1>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilter('')}
          className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap"
          style={{
            backgroundColor: filter === '' ? '#D23AB0' : 'transparent',
            color: filter === '' ? '#FFFFFF' : '#666',
            border: `1px solid ${filter === '' ? '#D23AB0' : '#222'}`,
            fontFamily: 'Outfit, sans-serif',
          }}>
          Toutes
        </button>
        {Object.entries(statusColors).map(([key, val]) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap"
            style={{
              backgroundColor: filter === key ? val.bg : 'transparent',
              color: filter === key ? '#FFFFFF' : '#666',
              border: `1px solid ${filter === key ? val.bg : '#222'}`,
              fontFamily: 'Outfit, sans-serif',
            }}>
            {val.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: '#D23AB0' }} />
        </div>
      ) : (
        <div className="space-y-2">
          {rentals.map((rental) => {
            const status = statusColors[rental.status] || statusColors.pending
            const transitions = statusTransitions[rental.status] || []
            const isExpanded = selectedRental === rental.id

            return (
              <div key={rental.id} style={{ backgroundColor: '#141414', border: `1px solid ${isExpanded ? '#D23AB0' : '#1a1a1a'}` }}>
                {/* Main row */}
                <div className="p-4 cursor-pointer transition-all hover:bg-[#1a1a1a]"
                  onClick={() => loadDetails(rental.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                          #{rental.id.slice(0, 8)}
                        </p>
                        <span className="text-xs px-2.5 py-1 uppercase tracking-wider font-semibold"
                          style={{ backgroundColor: `${status.bg}20`, color: status.bg, fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                        {rental.profiles?.full_name || 'Client'} · {formatDate(rental.start_date)} → {formatDate(rental.end_date)} · {rental.total_price} TND
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Action buttons */}
                      {transitions.map(t => (
                        <button key={t} onClick={(e) => { e.stopPropagation(); handleStatusChange(rental.id, t) }}
                          className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium transition-all"
                          style={{
                            backgroundColor: t === 'cancelled' ? 'rgba(255,107,107,0.1)' : `${statusColors[t]?.bg}20`,
                            color: statusColors[t]?.bg || '#666',
                            border: `1px solid ${statusColors[t]?.bg || '#222'}30`,
                            fontFamily: 'Outfit, sans-serif',
                          }}>
                          {t === 'confirmed' ? 'Accepter' : t === 'cancelled' ? 'Refuser' : t === 'delivered' ? 'Marquer livrée' : t === 'returned' ? 'Marquer retournée' : t === 'completed' ? 'Terminer' : t}
                        </button>
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(rental.id) }}
                        className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium transition-colors"
                        style={{ border: '1px solid #FF6B6B30', color: '#FF6B6B', fontFamily: 'Outfit, sans-serif' }}>
                        Supprimer
                      </button>
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: '#222' }}>
                    {loadingDetails ? (
                      <div className="flex justify-center py-6">
                        <div className="w-6 h-6 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: '#D23AB0' }} />
                      </div>
                    ) : details ? (
                      <div className="pt-4 space-y-4">
                        {/* Client info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>Client</p>
                            <p className="text-sm" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>{details.profiles?.full_name || '—'}</p>
                            {details.profiles?.phone && (
                              <p className="text-xs" style={{ color: '#888', fontFamily: 'Outfit, sans-serif' }}>{details.profiles.phone}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>Paiement</p>
                            <p className="text-sm" style={{ color: details.payment_status === 'paid' ? '#4CAF50' : '#FF9800', fontFamily: 'Outfit, sans-serif' }}>
                              {details.payment_status === 'paid' ? 'Payé' : details.payment_status || 'En attente'}
                            </p>
                            {details.payment_ref && (
                              <p className="text-xs" style={{ color: '#888', fontFamily: 'Outfit, sans-serif' }}>Réf: {details.payment_ref}</p>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        {details.delivery_address && (
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>Adresse de livraison</p>
                            <p className="text-sm" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                              {typeof details.delivery_address === 'string' ? details.delivery_address : JSON.stringify(details.delivery_address)}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {details.notes && (
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>Notes</p>
                            <p className="text-sm" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>{details.notes}</p>
                          </div>
                        )}

                        {/* Items */}
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                            Produits ({details.rental_items?.length || 0})
                          </p>
                          <div className="space-y-2">
                            {details.rental_items?.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 p-3" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222' }}>
                                {item.products?.images?.[0] && (
                                  <img src={item.products.images[0]} alt="" className="w-12 h-12 object-cover" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                                    {item.products?.name || 'Produit'}
                                  </p>
                                  <p className="text-xs" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                                    Qté: {item.quantity} · {item.price_per_day} TND/jour · {item.subtotal} TND total
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status timeline */}
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                            Actions rapides
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {statusTransitions[details.status]?.map(t => (
                              <button key={t} onClick={() => handleStatusChange(details.id, t)}
                                className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all"
                                style={{
                                  background: t === 'cancelled'
                                    ? 'linear-gradient(135deg, #FF6B6B, #EE5A5A)'
                                    : `linear-gradient(135deg, ${statusColors[t]?.bg}, ${statusColors[t]?.bg}CC)`,
                                  color: '#FFFFFF',
                                  fontFamily: 'Outfit, sans-serif',
                                }}>
                                {t === 'confirmed' ? '✓ Accepter' : t === 'cancelled' ? '✗ Refuser' : t === 'delivered' ? '🚚 Marquer livrée' : t === 'returned' ? '📦 Marquer retournée' : t === 'completed' ? '✔ Terminer' : t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}

          {rentals.length === 0 && (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>Aucune réservation</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
