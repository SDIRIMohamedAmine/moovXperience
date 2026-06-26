import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function PaymentResultPage() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') || 'pending'

  const statusConfig = {
    success: {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="#2E7D32" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: '#E8F5E9',
      border: '#A5D6A7',
      title: t('payment.success_title'),
      desc: t('payment.success_desc'),
    },
    failed: {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="#C62828" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: '#FFEBEE',
      border: '#EF9A9A',
      title: t('payment.failed_title'),
      desc: t('payment.failed_desc'),
    },
    pending: {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="#F57F17" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: '#FFF8E1',
      border: '#FFE082',
      title: t('payment.pending_title'),
      desc: t('payment.pending_desc'),
    },
    error: {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="#C62828" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      bg: '#FFEBEE',
      border: '#EF9A9A',
      title: t('payment.error_title'),
      desc: t('payment.error_desc'),
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="p-8" style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}>
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full"
          style={{ backgroundColor: config.bg, border: `2px solid ${config.border}` }}>
          {config.icon}
        </div>

        <h1 className="text-2xl mb-3"
          style={{  color: colors.primary, fontWeight: 600 }}>
          {config.title}
        </h1>

        <p className="text-sm mb-8"
          style={{ color: colors.textSecondary }}>
          {config.desc}
        </p>

        <div className="flex flex-col gap-3">
          <Link to="/my-rentals"
            className="px-6 py-3 text-sm font-medium text-center"
            style={{ backgroundColor: colors.cta, color: colors.textWhite }}>
            {t('payment.view_rentals')}
          </Link>
          <Link to="/catalog"
            className="text-sm text-center"
            style={{ color: colors.accent }}>
            {t('payment.back_catalog')}
          </Link>
        </div>
      </div>
    </div>
  )
}
