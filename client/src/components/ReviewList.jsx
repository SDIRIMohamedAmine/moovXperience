import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/LanguageContext'
import { fadeInUp, stagger } from '../lib/animations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={size} height={size} fill={star <= rating ? '#FFC107' : 'none'}
          stroke={star <= rating ? '#FFC107' : 'var(--border)'} strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  )
}

export { StarDisplay }

export default function ReviewList({ productId }) {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    fetch(`${API_URL}/reviews/product/${productId}`)
      .then(res => res.json())
      .then(data => { setReviews(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('reviews.no_reviews')}</p>
      </div>
    )
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <StarDisplay rating={Math.round(avgRating)} size={20} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{avgRating.toFixed(1)}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          ({reviews.length} {reviews.length === 1 ? t('reviews.review') : t('reviews.reviews')})
        </span>
      </div>

      <motion.div className="space-y-3" initial="hidden" animate="visible" variants={stagger}>
        {reviews.map((review) => (
          <motion.div key={review.id} variants={fadeInUp} transition={{ duration: 0.4 }}
            className="p-4 transition-all"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  {(review.profiles?.full_name || 'C').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {review.profiles?.full_name || t('reviews.anonymous')}
                </span>
              </div>
              <StarDisplay rating={review.rating} size={14} />
            </div>
            {review.comment && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
            )}
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
