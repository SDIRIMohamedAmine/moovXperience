import { useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
import { getDateLocale } from '../lib/locale'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const getStatusColors = (t) => ({
  pending: { bg: '#FEF3C7', text: '#92400E', label: t('demand_status.status.pending') },
  reviewing: { bg: '#DBEAFE', text: '#1E40AF', label: t('demand_status.status.reviewing') },
  accepted: { bg: '#D1FAE5', text: '#065F46', label: t('demand_status.status.accepted') },
  refused: { bg: '#FEE2E2', text: '#991B1B', label: t('demand_status.status.refused') },
  expired: { bg: '#F3F4F6', text: '#374151', label: t('demand_status.status.expired') },
})

export default function DemandStatusPage() {
  const { t, lang } = useTranslation()
  const statusColors = getStatusColors(t)
  const [email, setEmail] = useState('')
  const [quoteId, setQuoteId] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email && !quoteId) {
      setError(t('demand_status.validation_error'))
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const params = new URLSearchParams()
      if (email) params.set('email', email.trim())
      if (quoteId) params.set('quote_id', quoteId.trim())

      const res = await fetch(`${API_URL}/quotes/status?${params}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('demand_status.not_found'))
      }

      setResults(data.quotes || [])
      if (!data.quotes || data.quotes.length === 0) {
        setError(t('demand_status.not_found_email'))
      }
    } catch (err) {
      setError(err.message || t('demand_status.search_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <section className="py-12" style={{ backgroundColor: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)' }}>
            {t('demand_status.title')}
          </p>
          <h1 className="text-3xl mb-2 font-bold" style={{  color: 'var(--text-primary)' }}>
            {t('demand_status.heading')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('demand_status.description')}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  {t('demand_status.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('contact.email_placeholder')}
                  className="w-full px-4 py-3 text-sm"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  {t('demand_status.ref_number')}
                </label>
                <input
                  type="text"
                  value={quoteId}
                  onChange={(e) => setQuoteId(e.target.value)}
                  placeholder={t('demand_status.id_placeholder', 'ex: a1b2c3d4')}
                  className="w-full px-4 py-3 text-sm"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm uppercase tracking-widest font-semibold transition-all duration-300"
              style={{
                background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%)',
                color: '#FFFFFF',
                
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? t('demand_status.searching') : t('demand_status.search')}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="p-4 mb-6" style={{ backgroundColor: '#3D1515', border: '1px solid #5D2A2A' }}>
            <p className="text-sm" style={{ color: '#FF6B6B' }}>
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {results.length} {results.length > 1 ? t('demand_status.demands') : t('demand_status.demand')} {results.length > 1 ? t('demand_status.found_plural') : t('demand_status.found')}
            </p>
            {results.map((quote) => {
              const status = statusColors[quote.status] || statusColors.pending
              return (
                <div key={quote.id} className="p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                        {t('demand_status.ref')}
                      </p>
                      <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                        #{String(quote.id).slice(0, 8)}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: status.bg, color: status.text }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t('demand_status.solution')}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {quote.products?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t('demand_status.type')}</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {quote.mode === 'rental' ? t('rentals.rental') : t('rentals.purchase')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t('demand_status.estimated_total')}</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                        {Number(quote.estimated_total).toFixed(2)} TND
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t('demand_status.date')}</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {new Date(quote.created_at).toLocaleDateString(getDateLocale(lang))}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
