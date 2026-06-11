import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchAllRentals, isAdminLoggedIn } from '../../services/adminService'

const statusColors = {
  pending: { bg: '#FF9800', label: 'En attente' },
  confirmed: { bg: '#4CAF50', label: 'Confirmée' },
  delivered: { bg: '#7B61FF', label: 'Livrée' },
  returned: { bg: '#AE59CE', label: 'Retournée' },
  completed: { bg: '#4CAF50', label: 'Terminée' },
  cancelled: { bg: '#FF6B6B', label: 'Annulée' },
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

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
            return (
              <div key={rental.id} className="p-4 transition-all"
                style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                      #{rental.id.slice(0, 8)} — {rental.profiles?.full_name || 'Client'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                      {formatDate(rental.start_date)} → {formatDate(rental.end_date)} · {rental.total_price} TND
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rental.payment_status && (
                      <span className="text-xs px-2 py-0.5 uppercase tracking-wider"
                        style={{
                          backgroundColor: rental.payment_status === 'paid' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                          color: rental.payment_status === 'paid' ? '#4CAF50' : '#FF9800',
                          fontFamily: 'Outfit, sans-serif', fontSize: '10px',
                        }}>
                        {rental.payment_status}
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-1 uppercase tracking-wider font-semibold"
                      style={{ backgroundColor: `${status.bg}20`, color: status.bg, fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
