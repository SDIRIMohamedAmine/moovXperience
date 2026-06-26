import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchUsers, updateUserRole, isAdminLoggedIn } from '../../services/adminService'
import { showToast } from '../../components/Toast'
import { useTranslation } from '../../i18n/LanguageContext'
import { getDateLocale } from '../../lib/locale'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function AdminUsers() {
  const { t, lang } = useTranslation()
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDemands, setUserDemands] = useState([])
  const [loadingDemands, setLoadingDemands] = useState(false)

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setLoading(true)
      fetchUsers()
        .then((data) => {
          // Only show clients
          const clients = (data.users || []).filter(u => u.role !== 'admin')
          setUsers(clients)
          setTotal(clients.length)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  const loadUserDemands = async (user) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null)
      setUserDemands([])
      return
    }
    setSelectedUser(user)
    setLoadingDemands(true)
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch(`${API_URL}/quotes/all?client_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserDemands(data.quotes || data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDemands(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)' }}>
          {t('admin.login_title')}
        </p>
        <h1 className="text-3xl font-bold" style={{  color: '#FFFFFF' }}>
          {t('admin.users')} <span className="text-lg font-normal" style={{ color: '#666' }}>({total})</span>
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const isSelected = selectedUser?.id === user.id
            return (
              <div key={user.id}>
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer transition-all"
                  style={{ backgroundColor: isSelected ? '#1a1a1a' : '#141414', border: `1px solid ${isSelected ? 'var(--accent)' : '#1a1a1a'}` }}
                  onClick={() => loadUserDemands(user)}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #AE59CE)', color: '#FFFFFF' }}>
                    {(user.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#FFFFFF' }}>
                      {user.full_name || t('admin.no_name')}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#666' }}>
                      {user.email || '—'} · {user.phone || '—'} · {new Date(user.created_at).toLocaleDateString(getDateLocale(lang))}
                    </p>
                  </div>
                  {user.company_name && (
                    <span className="text-xs px-2.5 py-1" style={{ backgroundColor: 'rgba(176,186,153,0.1)', color: '#B0BA99' }}>
                      {user.company_name}
                    </span>
                  )}
                  <svg className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180' : ''}`} fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Expanded: user demands */}
                {isSelected && (
                  <div className="px-4 pb-4" style={{ backgroundColor: '#141414', borderLeft: '1px solid var(--accent)', borderRight: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
                    {loadingDemands ? (
                      <div className="flex justify-center py-6">
                        <div className="w-6 h-6 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
                      </div>
                    ) : userDemands.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: '#666' }}>
                          {t('profile.my_demands')} ({userDemands.length})
                        </p>
                        {userDemands.map((demand) => (
                          <div key={demand.id} className="flex items-center gap-3 p-3" style={{ backgroundColor: '#0D0D0D', border: '1px solid #222' }}>
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                                {demand.products?.name || demand.product_name || '—'}
                              </p>
                              <p className="text-xs" style={{ color: '#666' }}>
                                {demand.mode === 'rental' ? t('rentals.rental') : t('rentals.purchase')} · {demand.estimated_total} TND · {new Date(demand.created_at).toLocaleDateString(getDateLocale(lang))}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-0.5 uppercase tracking-wider font-semibold"
                              style={{
                                backgroundColor: demand.status === 'pending' ? 'rgba(255,152,0,0.1)' : demand.status === 'accepted' ? 'rgba(76,175,80,0.1)' : demand.status === 'refused' ? 'rgba(255,107,107,0.1)' : 'rgba(136,136,136,0.1)',
                                color: demand.status === 'pending' ? '#FF9800' : demand.status === 'accepted' ? '#4CAF50' : demand.status === 'refused' ? '#FF6B6B' : '#888',
                                 fontSize: '10px',
                              }}>
                              {t(`demand_status.status.${demand.status}`)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs py-4 text-center" style={{ color: '#666' }}>
                        {t('profile.no_demands')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
