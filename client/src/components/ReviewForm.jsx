import { useState } from 'react'
import { useTheme } from '../theme/ThemeContext'
import { useTranslation } from '../i18n/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { getFreshToken } from '../lib/supabase'
import { showToast } from './Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function ReviewForm({ productId, rentalId, onSuccess }) {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { session } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      showToast(t('reviews.select_rating'), 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getFreshToken()}`,
        },
        body: JSON.stringify({
          rental_id: rentalId,
          product_id: productId,
          rating,
          comment: comment || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit review')
      }

      showToast(t('reviews.submit_success'), 'success')
      setRating(0)
      setComment('')
      if (onSuccess) onSuccess()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <form onSubmit={handleSubmit} className="p-4" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgWhite }}>
      <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 500 }}>
        {t('reviews.write_review')}
      </h3>

      {/* Star selector */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5 transition-transform hover:scale-110">
            <svg width="24" height="24" fill={star <= displayRating ? '#FFC107' : 'none'}
              stroke={star <= displayRating ? '#FFC107' : colors.border} strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('reviews.comment_placeholder')}
        rows={3}
        maxLength={2000}
        className="w-full px-3 py-2 text-sm resize-none mb-3"
        style={{ border: `1px solid ${colors.border}`, color: colors.primary, fontFamily: 'DM Sans, system-ui, sans-serif' }}
        onFocus={(e) => (e.target.style.borderColor = colors.accent)}
        onBlur={(e) => (e.target.style.borderColor = colors.border)}
      />

      <button type="submit" disabled={loading || rating === 0}
        className="px-4 py-2 text-sm font-medium transition-opacity"
        style={{
          backgroundColor: colors.cta,
          color: colors.textWhite,
          fontFamily: 'DM Sans, system-ui, sans-serif',
          opacity: loading || rating === 0 ? 0.5 : 1,
          cursor: loading || rating === 0 ? 'not-allowed' : 'pointer',
        }}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('reviews.submitting')}
          </span>
        ) : t('reviews.submit')}
      </button>
    </form>
  )
}
