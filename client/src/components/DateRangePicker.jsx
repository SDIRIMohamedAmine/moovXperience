import { useState, useEffect, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { fetchAvailability } from '../services/rentalService'
import { useTranslation } from '../i18n/LanguageContext'
import { getDateLocale } from '../lib/locale'

export default function DateRangePicker({ productId, selectedRange, onSelect }) {
  const { t, lang } = useTranslation()
  const [unavailable, setUnavailable] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!productId) return
    const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
    let cancelled = false
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    fetchAvailability(productId, month)
      .then(data => {
        if (!cancelled) setUnavailable(data.unavailable || [])
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [productId, currentMonth])

  const disabledDates = useMemo(() => {
    const disabled = []
    // Disable past dates
    disabled.push({ before: new Date() })
    // Disable unavailable date ranges
    for (const range of unavailable) {
      disabled.push({
        from: new Date(range.start_date + 'T00:00:00'),
        to: new Date(range.end_date + 'T00:00:00'),
      })
    }
    return disabled
  }, [unavailable])

  const handleSelect = (range) => {
    if (!range?.from) {
      onSelect(null)
      return
    }
    onSelect({
      from: range.from,
      to: range.to || null,
    })
  }

  const formatShort = (date) => {
    return date.toLocaleDateString(getDateLocale(lang), { day: 'numeric', month: 'short' })
  }

  return (
    <div>
      {loading && (
        <div className="text-xs mb-2" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {t('common.loading')}
        </div>
      )}
      <div className="date-picker-wrapper">
        <DayPicker
          mode="range"
          selected={selectedRange?.from ? selectedRange : undefined}
          onSelect={handleSelect}
          disabled={disabledDates}
          numberOfMonths={1}
          onMonthChange={setCurrentMonth}
          navLayout="around"
          styles={{
            caption_label: { color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 500, fontSize: '14px' },
            weekday: { color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '11px', textTransform: 'uppercase' },
            day: { fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '13px', borderRadius: '0', margin: 0 },
          }}
        />
      </div>
      {selectedRange?.from && selectedRange?.to && (
        <div className="mt-2 text-xs" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {formatShort(selectedRange.from)} — {formatShort(selectedRange.to)}
        </div>
      )}
    </div>
  )
}
