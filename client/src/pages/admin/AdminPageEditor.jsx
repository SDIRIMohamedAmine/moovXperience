import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { isAdminLoggedIn } from '../../services/adminService'
import { Navigate, Link } from 'react-router-dom'
import MediaUploader from '../../components/MediaUploader'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const ICON_OPTIONS = [
  { value: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', label: 'Lightning' },
  { value: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', label: 'Users' },
  { value: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', label: 'Shield' },
  { value: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z', label: 'Star' },
  { value: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z', label: 'Heart' },
  { value: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18', label: 'Bulb' },
]

export default function AdminPageEditor() {
  const { t } = useTranslation()
  const { dark } = useTheme()
  const [lang, setLang] = useState('fr')
  const [pages, setPages] = useState({ fr: null, en: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ tag: '', title: '', subtitle: '', sections: [], cover_image: '' })
  const [mediaFiles, setMediaFiles] = useState([])

  const fetchPage = (language) => {
    const token = localStorage.getItem('admin-token')
    return fetch(`${API_URL}/pages/about?lang=${language}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .catch(() => null)
  }

  useEffect(() => {
    if (!isAdminLoggedIn()) return
    setLoading(true)
    Promise.all([fetchPage('fr'), fetchPage('en')]).then(([fr, en]) => {
      setPages({ fr, en })
      const current = lang === 'fr' ? fr : en
      if (current) {
        setForm({ tag: current.tag || '', title: current.title || '', subtitle: current.subtitle || '', sections: current.sections || [], cover_image: current.cover_image || '' })
        if (current.cover_image) setMediaFiles([{ url: current.cover_image, type: 'image', name: 'cover' }])
      }
      setLoading(false)
    })
  }, [])

  const switchLang = (newLang) => {
    setLang(newLang)
    const data = pages[newLang]
    if (data) {
      setForm({ tag: data.tag || '', title: data.title || '', subtitle: data.subtitle || '', sections: data.sections || [], cover_image: data.cover_image || '' })
      if (data.cover_image) setMediaFiles([{ url: data.cover_image, type: 'image', name: 'cover' }])
      else setMediaFiles([])
    } else {
      setForm({ tag: '', title: '', subtitle: '', sections: [], cover_image: '' })
      setMediaFiles([])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const token = localStorage.getItem('admin-token')
    try {
      await fetch(`${API_URL}/admin/pages/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lang, ...form, cover_image: mediaFiles[0]?.url || '' }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const updateSection = (index, field, value) => {
    const updated = [...form.sections]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, sections: updated })
  }

  const addSection = () => {
    setForm({ ...form, sections: [...form.sections, { title: '', description: '', icon: ICON_OPTIONS[0].value }] })
  }

  const removeSection = (index) => {
    setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) })
  }

  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" replace />

  const card = { backgroundColor: dark ? '#141414' : '#FAFAFA', border: `1px solid ${dark ? '#1a1a1a' : '#E8E8EC'}`, borderRadius: '12px' }
  const inputStyle = {
    backgroundColor: dark ? '#0F0F14' : '#FFFFFF',
    border: `1px solid ${dark ? '#1a1a1a' : '#E8E8EC'}`,
    color: dark ? '#F5F5F7' : '#1A1A2E',
    
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    outline: 'none',
  }
  const labelStyle = { color: dark ? '#666' : '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '6px', display: 'block' }

  return (
    <div className="min-h-screen" style={{ backgroundColor: dark ? '#0D0D0D' : '#FFFFFF' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin" className="text-xs uppercase tracking-wider mb-2 inline-block" style={{ color: 'var(--accent)' }}>
              {t('admin.dashboard')}
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>
              {t('admin.page_editor')}
            </h1>
            <p className="text-sm mt-1" style={{ color: dark ? '#666' : '#888' }}>
              {t('admin.page_editor_desc')} — About
            </p>
          </div>
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 mb-6 p-1" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0', borderRadius: '10px', width: 'fit-content' }}>
          {['fr', 'en'].map((l) => (
            <button key={l} onClick={() => switchLang(l)}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all"
              style={{
                backgroundColor: lang === l ? (dark ? '#1a1a1a' : '#FFFFFF') : 'transparent',
                color: lang === l ? 'var(--accent)' : (dark ? '#666' : '#999'),
                borderRadius: '8px',
                cursor: 'pointer',
                
                boxShadow: lang === l ? (dark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)') : 'none',
              }}>
              {l === 'fr' ? 'Francais' : 'English'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-20 rounded-xl" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0' }} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Hero fields */}
            <div style={card} className="p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>{t('admin.cms_tag')}</label>
                  <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} style={inputStyle} placeholder="About Us" />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.cms_title')}</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ ...inputStyle, fontSize: '18px', fontWeight: '700' }} placeholder="Who We Are" />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.cms_subtitle')}</label>
                  <textarea rows={3} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} style={{ ...inputStyle, resize: 'none' }} placeholder="A short description..." />
                </div>
              </div>
            </div>

            {/* Cover image */}
            <div style={card} className="p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>{t('admin.editor_cover_image')}</h3>
              <MediaUploader files={mediaFiles} onChange={setMediaFiles} maxFiles={1} folder="pages" />
            </div>

            {/* Sections */}
            <div style={card} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>{t('admin.cms_sections')}</h3>
                <button onClick={addSection}
                  className="text-xs px-3 py-1.5 font-semibold transition-colors"
                  style={{ border: `1px solid ${dark ? '#333' : '#DDD'}`, color: 'var(--accent)', cursor: 'pointer', borderRadius: '8px' }}>
                  + {t('admin.cms_add_section')}
                </button>
              </div>

              {form.sections.length === 0 && (
                <p className="text-sm py-8 text-center" style={{ color: dark ? '#444' : '#BBB' }}>
                  {t('admin.editor_no_content')}
                </p>
              )}

              <div className="space-y-4">
                {form.sections.map((section, i) => (
                  <div key={i} className="p-4" style={{ backgroundColor: dark ? '#0F0F14' : '#FFFFFF', border: `1px solid ${dark ? '#222' : '#E8E8EC'}`, borderRadius: '10px' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold" style={{ color: dark ? '#555' : '#AAA' }}>#{i + 1}</span>
                      <button onClick={() => removeSection(i)} className="text-xs transition-colors"
                        style={{ color: '#F87171', cursor: 'pointer' }}>
                        {t('admin.cms_remove_section')}
                      </button>
                    </div>

                    {/* Icon selector */}
                    <div className="mb-3">
                      <label style={labelStyle}>{t('admin.editor_section_icon')}</label>
                      <div className="flex gap-2 flex-wrap">
                        {ICON_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => updateSection(i, 'icon', opt.value)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                            style={{
                              backgroundColor: section.icon === opt.value ? 'var(--accent-bg)' : (dark ? '#1a1a1a' : '#F5F5F5'),
                              border: `1px solid ${section.icon === opt.value ? 'var(--accent)' : (dark ? '#222' : '#E8E8EC')}`,
                              cursor: 'pointer',
                            }}>
                            <svg className="w-4 h-4" fill="none" stroke={section.icon === opt.value ? 'var(--accent)' : (dark ? '#666' : '#999')} strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d={opt.value} />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input value={section.title || ''} onChange={(e) => updateSection(i, 'title', e.target.value)}
                        placeholder={t('admin.cms_section_title')} style={inputStyle} />
                      <textarea rows={3} value={section.description || ''} onChange={(e) => updateSection(i, 'description', e.target.value)}
                        placeholder={t('admin.cms_section_desc')} style={{ ...inputStyle, resize: 'none' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-4">
              <button onClick={handleSave} disabled={saving}
                className="px-8 py-3 text-xs uppercase tracking-wider font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'var(--accent-gradient)', color: '#FFF', cursor: 'pointer', borderRadius: '9999px' }}>
                {saving ? '...' : t('admin.blog_save')}
              </button>
              {saved && (
                <span className="text-xs font-medium" style={{ color: '#4ADE80' }}>
                  {t('admin.page_saved')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
