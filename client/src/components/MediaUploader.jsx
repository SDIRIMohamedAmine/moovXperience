import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { showToast } from './Toast'
import { useTranslation } from '../i18n/LanguageContext'

export default function MediaUploader({ files = [], onChange, maxFiles = 10, folder = 'products' }) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const acceptTypes = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime'

  const handleUpload = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return
    if (files.length + selectedFiles.length > maxFiles) {
      showToast(t('media.max_files_reached'), 'error')
      return
    }

    setUploading(true)
    const newFiles = []

    for (const file of selectedFiles) {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      if (!isImage && !isVideo) continue

      // Check file size (50MB max for videos, 5MB for images)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        showToast(`${file.name} — ${t('media.file_too_large')} (max ${isVideo ? '50MB' : '5MB'})`, 'error')
        continue
      }

      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      try {
        const { data, error } = await supabase.storage
          .from('product-media')
          .upload(fileName, file, { cacheControl: '3600' })

        if (error) {
          console.error('Upload error:', error)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('product-media')
          .getPublicUrl(data.path)

        newFiles.push({
          url: urlData.publicUrl,
          type: isImage ? 'image' : 'video',
          name: file.name,
        })
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }

    if (newFiles.length > 0) {
      onChange([...files, ...newFiles])
    }
    setUploading(false)
  }

  const handleFileSelect = (e) => {
    handleUpload(Array.from(e.target.files))
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(Array.from(e.dataTransfer.files))
  }

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index))
  }

  const moveFile = (from, to) => {
    const newFiles = [...files]
    const [item] = newFiles.splice(from, 1)
    newFiles.splice(to, 0, item)
    onChange(newFiles)
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className="relative cursor-pointer p-8 text-center transition-all"
        style={{
          backgroundColor: dragOver ? 'var(--accent-bg)' : 'var(--bg)',
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        <input ref={fileInputRef} type="file" multiple accept={acceptTypes}
          onChange={handleFileSelect} className="hidden" />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('media.uploading')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10" fill="none" stroke="var(--text-muted)" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('media.drag_drop')} <span style={{ color: 'var(--accent)' }}>{t('media.browse')}</span>
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('media.accepted_formats')} — {t('media.max_files', { count: maxFiles })}
            </p>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-4">
          {files.map((file, index) => (
            <div key={index} className="relative group aspect-square"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {file.type === 'video' ? (
                <video src={file.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={file.url} alt="" className="w-full h-full object-cover" />
              )}

              {/* Video badge */}
              {file.type === 'video' && (
                <div className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}

              {/* Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                {index > 0 && (
                  <button onClick={() => moveFile(index, index - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                )}
                {index < files.length - 1 && (
                  <button onClick={() => moveFile(index, index + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                )}
                <button onClick={() => removeFile(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(255,107,107,0.8)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order number */}
              <div className="absolute bottom-1 left-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#FFFFFF', fontSize: '10px' }}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
