import { useTheme } from '../theme/ThemeContext'

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return score
}

const LABELS = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
const COLORS = ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50']

export default function PasswordStrength({ password }) {
  const { colors } = useTheme()

  if (!password || password.length === 0) return null

  const strength = getStrength(password)
  const percent = (strength / 5) * 100

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i < strength ? COLORS[strength - 1] : colors.border }} />
        ))}
      </div>
      <span className="text-xs" style={{ color: COLORS[strength - 1] || colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        {LABELS[strength - 1] || ''}
      </span>
    </div>
  )
}
