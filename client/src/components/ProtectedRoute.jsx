import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAuthModal } from '../contexts/AuthModalContext'
import { useTranslation } from '../i18n/LanguageContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()
  const { showLoginModal } = useAuthModal()
  const { t } = useTranslation()
  const [modalShown, setModalShown] = useState(false)

  useEffect(() => {
    if (!loading && !user && !modalShown) {
      showLoginModal()
      setModalShown(true) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [loading, user, modalShown, showLoginModal])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#E0E3E6', borderTopColor: '#76ABAE' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('auth.login_required_action')}
        </p>
        <Link to="/" className="text-sm" style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('common.back_home')}
        </Link>
      </div>
    )
  }

  if (allowedRoles) {
    if (!profile) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('common.forbidden_desc')}
        </p>
        <Link to="/" className="text-sm" style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('common.back_home')}
        </Link>
      </div>
    )
    if (!allowedRoles.includes(profile.role)) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('common.forbidden_desc')}
        </p>
        <Link to="/" className="text-sm" style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('common.back_home')}
        </Link>
      </div>
    )
  }

  return children
}
