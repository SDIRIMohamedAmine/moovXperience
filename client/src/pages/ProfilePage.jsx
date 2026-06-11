import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const startEditing = () => {
    setFullName(profile?.full_name || '')
    setPhone(profile?.phone || '')
    setEditing(true)
    setMessage('')
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const { error } = await updateProfile({ full_name: fullName, phone })
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
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
      </div>
    )
  }

  const roleLabel = profile.role === 'supplier' ? t('profile.supplier_role') : profile.role === 'admin' ? t('profile.admin_role') : t('profile.client_role')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('profile.my_account')}
        </p>
        <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
          {t('profile.title')}
        </h1>
      </div>

      {message && (
        <div className="mb-6 p-4 text-sm" style={{ backgroundColor: colors.successBg, color: colors.successText, border: `1px solid ${colors.successBorder}` }}>
          {message}
        </div>
      )}

      <div style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }} className="p-8">
        <div className="flex items-center gap-5 mb-8 pb-8" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="w-16 h-16 flex items-center justify-center text-xl font-medium"
            style={{ backgroundColor: colors.primary, color: colors.textWhite, fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-lg" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
              {profile?.full_name || t('profile.name_not_set')}
            </div>
            <div className="text-sm" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {user?.email}
            </div>
            <div className="text-xs uppercase tracking-wider mt-1" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {roleLabel}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Field colors={colors} label={t('profile.full_name')} value={profile?.full_name} editing={editing} editValue={fullName} onEditChange={setFullName} />
          <Field colors={colors} label={t('profile.phone')} value={profile?.phone} editing={editing} editValue={phone} onEditChange={setPhone} type="tel" />
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {t('profile.email')}
            </label>
            <p className="text-sm" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 text-sm uppercase tracking-widest font-medium transition-colors"
                style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = colors.ctaHover)}
                onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}>
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('profile.saving')}
                  </span>
                ) : t('profile.save')}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-6 py-2.5 text-sm uppercase tracking-widest font-medium transition-colors"
                style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                onMouseEnter={(e) => { e.target.style.borderColor = colors.primary; e.target.style.color = colors.primary }}
                onMouseLeave={(e) => { e.target.style.borderColor = colors.border; e.target.style.color = colors.textSecondary }}>
                {t('profile.cancel')}
              </button>
            </>
          ) : (
            <button onClick={startEditing}
              className="px-6 py-2.5 text-sm uppercase tracking-widest font-medium transition-colors"
              style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}
              onMouseEnter={(e) => { e.target.style.borderColor = colors.accent; e.target.style.color = colors.accent }}
              onMouseLeave={(e) => { e.target.style.borderColor = colors.border; e.target.style.color = colors.textSecondary }}>
              {t('profile.edit')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, editing, editValue, onEditChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        {label}
      </label>
      {editing ? (
        <input type={type} value={editValue} onChange={(e) => onEditChange(e.target.value)}
          className="w-full px-4 py-3 text-sm transition-colors"
          style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
          onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
          onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
        />
      ) : (
        <p className="text-sm" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {value || '—'}
        </p>
      )}
    </div>
  )
}
