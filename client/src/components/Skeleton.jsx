import { useTheme } from '../theme/ThemeContext'

export function SkeletonBlock({ className = '', style = {} }) {
  const { colors } = useTheme()
  return (
    <div className={`animate-pulse ${className}`}
      style={{ backgroundColor: colors.border, borderRadius: '4px', ...style }} />
  )
}

export function SkeletonCard() {
  const { colors } = useTheme()
  return (
    <div className="overflow-hidden" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgWhite }}>
      <SkeletonBlock style={{ aspectRatio: '4/5', borderRadius: 0 }} />
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-3 w-1/3" />
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  const { colors } = useTheme()
  return (
    <div className="p-4 flex items-center gap-4" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgWhite }}>
      <SkeletonBlock className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-1/3" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
      <SkeletonBlock className="h-6 w-16" />
    </div>
  )
}

export function SkeletonStat() {
  const { colors } = useTheme()
  return (
    <div className="p-5" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgWhite }}>
      <div className="flex items-center gap-3 mb-3">
        <SkeletonBlock className="w-10 h-10 rounded-lg" />
        <SkeletonBlock className="h-8 w-12" />
      </div>
      <SkeletonBlock className="h-3 w-1/2 mb-1" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  )
}
