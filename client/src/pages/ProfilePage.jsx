import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getFreshToken } from '../lib/supabase'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '../lib/animations'
import { getDateLocale } from '../lib/locale'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const getStatusColors = (t) => ({
  pending: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)', label: t('profile.status.pending') },
  reviewing: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)', label: t('profile.status.reviewing') },
  accepted: { bg: 'var(--status-accepted-bg)', text: 'var(--status-accepted-text)', label: t('profile.status.accepted') },
  refused: { bg: 'var(--status-refused-bg)', text: 'var(--status-refused-text)', label: t('profile.status.refused') },
  expired: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)', label: t('profile.status.expired') },
})

export default function ProfilePage() {
  const { user, profile, session, updateProfile } = useAuth()
  const { t, lang } = useTranslation()
  const { colors } = useTheme()
  const statusColors = getStatusColors(t)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [demands, setDemands] = useState([])
  const [loadingDemands, setLoadingDemands] = useState(true)

  useEffect(() => {
    if (user?.email) {
      fetch(`${API_URL}/quotes/status?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          setDemands(data.quotes || [])
          setLoadingDemands(false)
        })
        .catch(() => setLoadingDemands(false))
    }
  }, [user?.email])

  const handleDeleteDemand = async (id) => {
    if (!confirm(t('profile.delete_confirm'))) return
    try {
      const res = await fetch(`${API_URL}/quotes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${await getFreshToken()}` },
      })
      if (res.ok) {
        setDemands(demands.filter(d => d.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || t('profile.delete_error'))
      }
    } catch {
      alert(t('profile.delete_error'))
    }
  }

  const startEditing = () => {
    setFullName(profile?.full_name || '')
    setPhone(profile?.phone || '')
    setCompanyName(profile?.company_name || '')
    setEditing(true)
    setMessage('')
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const { error } = await updateProfile({ full_name: fullName, phone, company_name: companyName })
    if (error) {
      setMessage(t('profile.error'))
    } else {
      setMessage(t('profile.success'))
      setEditing(false)
    }
    setSaving(false)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <section className="py-12" style={{ backgroundColor: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)' }}>
            {t('profile.my_account')}
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {profile?.full_name || t('profile.title')}
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {message && (
          <div className="mb-6 p-4 text-sm" style={{ backgroundColor: '#152D1A', color: '#4CAF50', border: '1px solid #2A5D2A' }}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))', color: '#FFFFFF' }}>
                  {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile?.full_name || t('profile.name_not_set')}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
                {profile?.company_name && (
                  <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
                    {profile.company_name}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('profile.phone')}</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{profile?.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('profile.my_demands')}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{demands.length}</span>
                </div>
              </div>

              <button onClick={editing ? handleSave : startEditing} disabled={saving}
                className="w-full mt-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all"
                style={{
                  background: editing ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'transparent',
                  border: editing ? 'none' : '1px solid var(--border)',
                  color: editing ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}>
                {saving ? t('profile.saving') : editing ? t('profile.save') : t('profile.edit')}
              </button>
              {editing && (
                <button onClick={() => setEditing(false)}
                  className="w-full mt-2 py-2.5 text-xs uppercase tracking-widest font-medium"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {t('profile.cancel')}
                </button>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Edit form */}
            {editing && (
              <div className="p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm uppercase tracking-wider font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
                  {t('profile.personal_info')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{t('profile.full_name')}</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 text-sm"
                      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{t('profile.phone')}</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 text-sm"
                      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{t('profile.company')}</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 text-sm"
                      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                </div>
              </div>
            )}

            {/* Demands section */}
            <div className="p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                  {t('profile.my_demands')}
                </h3>
                <Link to="/catalog" className="text-xs uppercase tracking-wider font-medium"
                  style={{ color: 'var(--accent)' }}>
                  + {t('profile.new_demand')}
                </Link>
              </div>

              {loadingDemands ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
                </div>
              ) : demands.length > 0 ? (
                <div className="space-y-3">
                  {demands.map((demand) => {
                    const status = statusColors[demand.status] || statusColors.pending
                    return (
                      <div key={demand.id} className="p-4 transition-all hover:opacity-80"
                        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                              {demand.products?.name || t('profile.demand_solution')}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              #{String(demand.id).slice(0, 8)} — {new Date(demand.created_at).toLocaleDateString(getDateLocale(lang))}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                              style={{ backgroundColor: status.bg, color: status.text }}>
                              {status.label}
                            </span>
                            {demand.status === 'pending' && (
                              <button onClick={() => handleDeleteDemand(demand.id)}
                                className="p-1 transition-colors"
                                style={{ color: '#FF5722', cursor: 'pointer' }}
                                title={t('checkout.remove')}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {demand.mode === 'rental' ? t('rentals.rental') : t('rentals.purchase')}
                          </span>
                          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                            {Number(demand.estimated_total).toFixed(2)} TND
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="var(--border)" strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0H8.25m0 0H6.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V12.75" />
                  </svg>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t('profile.no_demands')}
                  </p>
                  <Link to="/catalog" className="text-xs uppercase tracking-wider font-medium"
                    style={{ color: 'var(--accent)' }}>
                    {t('profile.browse_catalog')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
