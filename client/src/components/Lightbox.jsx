import { useEffect, useCallback } from 'react'

export default function Lightbox({ files = [], activeIndex = 0, onClose, onNavigate }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onNavigate(Math.max(0, activeIndex - 1))
    if (e.key === 'ArrowRight') onNavigate(Math.min(files.length - 1, activeIndex + 1))
  }, [activeIndex, files.length, onClose, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!files.length) return null

  const current = files[activeIndex]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}>

      {/* Close button */}
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-sm font-medium z-10"
        style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif' }}>
        {activeIndex + 1} / {files.length}
      </div>

      {/* Navigation */}
      {files.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNavigate(Math.max(0, activeIndex - 1)) }}
            className="absolute left-4 w-12 h-12 flex items-center justify-center rounded-full transition-colors z-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', opacity: activeIndex === 0 ? 0.3 : 1 }}>
            <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNavigate(Math.min(files.length - 1, activeIndex + 1)) }}
            className="absolute right-4 w-12 h-12 flex items-center justify-center rounded-full transition-colors z-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', opacity: activeIndex === files.length - 1 ? 0.3 : 1 }}>
            <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Media */}
      <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}>
        {current.type === 'video' ? (
          <video src={current.url} controls autoPlay
            className="max-w-full max-h-[85vh] object-contain" />
        ) : (
          <img src={current.url} alt=""
            className="max-w-full max-h-[85vh] object-contain" />
        )}
      </div>

      {/* Thumbnail strip */}
      {files.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] px-4">
          {files.map((file, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); onNavigate(i) }}
              className="flex-shrink-0 w-14 h-14 overflow-hidden transition-all"
              style={{
                border: `2px solid ${i === activeIndex ? '#D23AB0' : 'transparent'}`,
                opacity: i === activeIndex ? 1 : 0.5,
              }}>
              {file.type === 'video' ? (
                <video src={file.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={file.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
