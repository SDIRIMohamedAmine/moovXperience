import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="14" height="14" fill={star <= rating ? 'var(--accent)' : 'var(--border)'} viewBox="0 0 24 24">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsSection() {
  const { t, lang } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/reviews/recent?limit=6`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || reviews.length === 0) return null

  const locale = lang === 'fr' ? 'fr-FR' : 'en-US'

  return (
    <section className="py-20 relative" style={{ backgroundColor: 'var(--bg-overlay)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
          className="text-center mb-12">
          <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-2 font-medium"
            style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
            {t('reviews.tag')}
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            {t('reviews.title')}
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div key={review.id} variants={fadeInUp} custom={i}
              className="p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={review.rating} />
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
                  {new Date(review.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  "{review.comment}"
                </p>
              )}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', fontFamily: 'Outfit, sans-serif' }}>
                  {review.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                    {review.profiles?.full_name || t('reviews.anonymous')}
                  </p>
                  {review.products && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
                      {review.products.name}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
