import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchUsers, updateUserRole, isAdminLoggedIn } from '../../services/adminService'
import { showToast } from '../../components/Toast'
import { useTranslation } from '../../i18n/LanguageContext'
import { getDateLocale } from '../../lib/locale'

const roleColors = {
  client: { bg: '#4CAF50' },
  supplier: { bg: '#7B61FF' },
  admin: { bg: '#D23AB0' },
}

export default function AdminUsers() {
  const { t, lang } = useTranslation()
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setLoading(true)
      fetchUsers({ role: filter || undefined })
        .then((data) => { setUsers(data.users); setTotal(data.total) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [filter])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      showToast(t('admin.role_updated'), 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
          {t('admin.login_title')}
        </p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('admin.users')} <span className="text-lg font-normal" style={{ color: '#666' }}>({total})</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'client', 'supplier', 'admin'].map((r) => (
          <button key={r} onClick={() => setFilter(r)}
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all"
            style={{
              backgroundColor: filter === r ? 'var(--accent)' : 'transparent',
              color: filter === r ? '#FFFFFF' : '#666',
              border: `1px solid ${filter === r ? 'var(--accent)' : '#222'}`,
              fontFamily: 'Outfit, sans-serif',
            }}>
            {r === '' ? t('admin.all_roles') : t(`admin.user_role_${r}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const role = roleColors[user.role] || roleColors.client
            return (
              <div key={user.id} className="flex items-center gap-4 p-4 transition-all"
                style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #AE59CE)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                  {(user.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                    {user.full_name || t('admin.no_name')}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                    {user.phone || '—'} · {new Date(user.created_at).toLocaleDateString(getDateLocale(lang))}
                  </p>
                </div>
                <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider"
                  style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', color: role.bg, fontFamily: 'Outfit, sans-serif' }}>
                  <option value="client">{t('admin.user_role_client')}</option>
                  <option value="supplier">{t('admin.user_role_supplier')}</option>
                  <option value="admin">{t('admin.user_role_admin')}</option>
                </select>
                <span className="text-xs px-2.5 py-1 uppercase tracking-wider font-semibold"
                  style={{ backgroundColor: `${role.bg}20`, color: role.bg, fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
                  {t(`admin.user_role_${user.role}`)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
