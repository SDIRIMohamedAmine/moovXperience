import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { fetchProduct } from '../services/productService'
import { createQuote } from '../services/quoteService'
import { showToast } from '../components/Toast'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function QuotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    company_name: '',
    mode: 'rental',
    duration_days: '7',
    event_date: '',
    event_location: '',
    notes: '',
  })
  const [selectedOptions, setSelectedOptions] = useState({})

  useEffect(() => {
    fetchProduct(id)
      .then((p) => {
        setProduct(p)
        if (p.mode === 'sale' && p.mode !== 'both') setForm(f => ({ ...f, mode: 'purchase' }))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        client_name: f.client_name || user.user_metadata?.full_name || '',
        client_email: f.client_email || user.email || '',
      }))
    }
  }, [user])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleOption = (optName) => {
    setSelectedOptions(prev => ({ ...prev, [optName]: !prev[optName] }))
  }

  const options = product?.options || []
  const canRent = product?.mode === 'rental' || product?.mode === 'both'
  const canPurchase = product?.mode === 'sale' || product?.mode === 'both'

  // Auto-calculation
  const duration = Math.max(1, parseInt(form.duration_days) || 1)
  const basePrice = form.mode === 'rental'
    ? (product?.price_per_day || 0) * duration
    : (product?.price_purchase || 0)
  const optionsTotal = options
    .filter(opt => selectedOptions[opt.name])
    .reduce((sum, opt) => sum + opt.price, 0)
  const estimatedTotal = basePrice + optionsTotal

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.client_name || !form.client_email) return

    setSubmitting(true)
    try {
      const selectedOpts = options
        .filter(opt => selectedOptions[opt.name])
        .map(opt => ({ name: opt.name, price: opt.price, description: opt.description }))

      await createQuote({
        product_id: product.id,
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone || null,
        company_name: form.company_name || null,
        mode: form.mode,
        duration_days: form.mode === 'rental' ? duration : null,
        options: selectedOpts,
        event_date: form.event_date || null,
        event_location: form.event_location || null,
        notes: form.notes || null,
        estimated_total: estimatedTotal,
      }, user?.access_token)

      setSubmitted(true)
    } catch (err) {
      showToast(err.message || t('common.error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary }}>
          Solution non trouvée
        </h2>
        <Link to="/catalog" className="text-sm mt-4 inline-block" style={{ color: colors.accent }}>
          {t('product.back_to_catalog')}
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full"
            style={{ backgroundColor: colors.accentLight, border: `2px solid ${colors.accent}` }}>
            <svg className="w-10 h-10" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
            {t('quote.success_title')}
          </h2>
          <p className="text-sm mb-8" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('quote.success_desc')}
          </p>
          <Link to="/catalog"
            className="inline-block px-8 py-3 text-sm uppercase tracking-widest font-medium"
            style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('product.back_to_catalog')}
          </Link>
        </motion.div>
      </div>
    )
  }

  const inputStyle = { border: `1px solid ${colors.border}`, fontFamily: 'DM Sans, system-ui, sans-serif', color: colors.primary }
  const labelStyle = { color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }

  return (
    <div>
      {/* Header */}
      <section className="py-10" style={{ backgroundColor: colors.bgWhite, borderBottom: `1px solid ${colors.border}` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('quote.title')}
          </p>
          <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
            {product.name}
          </h1>
          <p className="text-sm mt-2" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('quote.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mode selection */}
              <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                <label className="block text-xs uppercase tracking-wider mb-3" style={labelStyle}>
                  {t('quote.mode')}
                </label>
                <div className="flex gap-3">
                  {canRent && (
                    <button type="button" onClick={() => handleChange('mode', 'rental')}
                      className="flex-1 p-4 text-left transition-all"
                      style={{
                        backgroundColor: form.mode === 'rental' ? colors.accentLight : colors.bgWhite,
                        border: `2px solid ${form.mode === 'rental' ? colors.accent : colors.border}`,
                      }}>
                      <div className="text-sm font-medium" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                        {t('quote.rental')}
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                        {product.price_per_day} {t('catalog.currency')}/{t('catalog.price_per_day').toLowerCase()}
                      </div>
                    </button>
                  )}
                  {canPurchase && (
                    <button type="button" onClick={() => handleChange('mode', 'purchase')}
                      className="flex-1 p-4 text-left transition-all"
                      style={{
                        backgroundColor: form.mode === 'purchase' ? colors.accentLight : colors.bgWhite,
                        border: `2px solid ${form.mode === 'purchase' ? colors.accent : colors.border}`,
                      }}>
                      <div className="text-sm font-medium" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                        {t('quote.purchase')}
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                        {product.price_purchase} {t('catalog.currency')}
                      </div>
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Duration — rental only */}
              {form.mode === 'rental' && (
                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
                    {t('quote.duration')}
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="number" value={form.duration_days} onChange={(e) => handleChange('duration_days', e.target.value)}
                      min="1" max="365"
                      className="w-24 px-4 py-3 text-sm text-center"
                      style={inputStyle}
                    />
                    <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {t('quote.duration_days')}
                    </span>
                    <div className="flex gap-2 ml-auto">
                      {['1', '3', '7', '14', '30'].map(d => (
                        <button key={d} type="button" onClick={() => handleChange('duration_days', d)}
                          className="px-3 py-1.5 text-xs transition-all"
                          style={{
                            backgroundColor: form.duration_days === d ? colors.primary : 'transparent',
                            color: form.duration_days === d ? colors.textWhite : colors.textSecondary,
                            border: `1px solid ${form.duration_days === d ? colors.primary : colors.border}`,
                            fontFamily: 'DM Sans, system-ui, sans-serif',
                          }}>
                          {d}j
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Options */}
              {options.length > 0 && (
                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                  <label className="block text-xs uppercase tracking-wider mb-3" style={labelStyle}>
                    {t('quote.options')}
                  </label>
                  <div className="space-y-2">
                    {options.map((opt) => (
                      <label key={opt.name}
                        className="flex items-start gap-3 p-3 cursor-pointer transition-all"
                        style={{
                          backgroundColor: selectedOptions[opt.name] ? colors.accentLight : colors.bgWhite,
                          border: `1px solid ${selectedOptions[opt.name] ? colors.accent : colors.border}`,
                        }}>
                        <input type="checkbox" checked={!!selectedOptions[opt.name]} onChange={() => toggleOption(opt.name)}
                          className="mt-0.5 accent-[#76ABAE]" />
                        <div className="flex-1">
                          <span className="text-sm font-medium" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                            {opt.name}
                          </span>
                          {opt.description && (
                            <p className="text-xs mt-0.5" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                              {opt.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                          +{opt.price} {t('catalog.currency')}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Contact info */}
              <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                <label className="block text-xs uppercase tracking-wider mb-3" style={labelStyle}>
                  {t('quote.contact_info')}
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={form.client_name} onChange={(e) => handleChange('client_name', e.target.value)}
                      placeholder={t('auth.full_name')} required
                      className="w-full px-4 py-3 text-sm" style={inputStyle}
                    />
                    <input type="email" value={form.client_email} onChange={(e) => handleChange('client_email', e.target.value)}
                      placeholder={t('auth.email')} required
                      className="w-full px-4 py-3 text-sm" style={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="tel" value={form.client_phone} onChange={(e) => handleChange('client_phone', e.target.value)}
                      placeholder={t('auth.phone')}
                      className="w-full px-4 py-3 text-sm" style={inputStyle}
                    />
                    <input type="text" value={form.company_name} onChange={(e) => handleChange('company_name', e.target.value)}
                      placeholder={t('auth.company_name')}
                      className="w-full px-4 py-3 text-sm" style={inputStyle}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Event details */}
              <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                <label className="block text-xs uppercase tracking-wider mb-3" style={labelStyle}>
                  {t('quote.event_date')}
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={form.event_date} onChange={(e) => handleChange('event_date', e.target.value)}
                      className="w-full px-4 py-3 text-sm" style={inputStyle}
                    />
                    <input type="text" value={form.event_location} onChange={(e) => handleChange('event_location', e.target.value)}
                      placeholder={t('quote.event_location')}
                      className="w-full px-4 py-3 text-sm" style={inputStyle}
                    />
                  </div>
                  <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder={t('quote.notes_placeholder')} rows={3}
                    className="w-full px-4 py-3 text-sm resize-y" style={inputStyle}
                  />
                </div>
              </motion.div>
            </div>

            {/* Right — Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6" style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}>
                <h3 className="text-lg mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
                  {t('quote.price_breakdown')}
                </h3>

                {/* Product */}
                <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <div className="w-12 h-12 flex-shrink-0" style={{ backgroundColor: colors.accentLight }}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke={colors.accent} strokeWidth="1" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {product.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {form.mode === 'rental' ? t('quote.rental') : t('quote.purchase')}
                    </p>
                  </div>
                </div>

                {/* Line items */}
                <div className="space-y-2 mb-4">
                  {form.mode === 'rental' ? (
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      <span style={{ color: colors.textSecondary }}>
                        {product.price_per_day} × {duration} {t('quote.duration_days')}
                      </span>
                      <span style={{ color: colors.primary }}>{basePrice.toFixed(2)} {t('catalog.currency')}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      <span style={{ color: colors.textSecondary }}>{t('quote.purchase')}</span>
                      <span style={{ color: colors.primary }}>{basePrice.toFixed(2)} {t('catalog.currency')}</span>
                    </div>
                  )}

                  {options.filter(opt => selectedOptions[opt.name]).map(opt => (
                    <div key={opt.name} className="flex justify-between text-sm" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      <span style={{ color: colors.textSecondary }}>{opt.name}</span>
                      <span style={{ color: colors.primary }}>+{opt.price.toFixed(2)} {t('catalog.currency')}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-4" style={{ borderTop: `2px solid ${colors.primary}` }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-wider" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {t('quote.estimated_total')}
                    </span>
                    <span className="text-2xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.cta, fontWeight: 600 }}>
                      {estimatedTotal.toFixed(2)} {t('catalog.currency')}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={submitting || !form.client_name || !form.client_email}
                  className="w-full mt-6 py-3.5 text-sm uppercase tracking-widest font-medium transition-all"
                  style={{
                    backgroundColor: colors.cta,
                    color: colors.textWhite,
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    opacity: (submitting || !form.client_name || !form.client_email) ? 0.5 : 1,
                    cursor: (submitting || !form.client_name || !form.client_email) ? 'not-allowed' : 'pointer',
                  }}>
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('quote.submitting')}
                    </span>
                  ) : t('quote.submit')}
                </button>

                <p className="text-xs text-center mt-3" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {t('quote.success_desc')}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
