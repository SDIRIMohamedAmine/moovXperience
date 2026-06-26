export function SkeletonBlock({ className = '', style = {} }) {
  return (
    <div className={className}
      style={{
        background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        borderRadius: '8px',
        ...style,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', borderRadius: '16px' }}>
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
  return (
    <div className="p-4 flex items-center gap-4" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
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
  return (
    <div className="p-5" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
      <div className="flex items-center gap-3 mb-3">
        <SkeletonBlock className="w-10 h-10 rounded-lg" />
        <SkeletonBlock className="h-8 w-12" />
      </div>
      <SkeletonBlock className="h-3 w-1/2 mb-1" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  )
}
