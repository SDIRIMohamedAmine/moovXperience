import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { isAdminLoggedIn } from '../../services/adminService'
import { Navigate, Link } from 'react-router-dom'
import MediaUploader from '../../components/MediaUploader'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function PostEditor({ post, onSave, onCancel }) {
  const { t } = useTranslation()
  const { dark } = useTheme()
  const bodyRef = useRef(null)
  const [form, setForm] = useState(post || {
    slug: '', lang: 'fr', title: '', excerpt: '', body: '', cover_image: '', status: 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [mediaFiles, setMediaFiles] = useState(() => {
    if (post?.cover_image) return [{ url: post.cover_image, type: 'image', name: 'cover' }]
    return []
  })

  const handleSave = async (status) => {
    setSaving(true)
    const token = localStorage.getItem('admin-token')
    const method = post?.id ? 'PUT' : 'POST'
    const url = post?.id ? `${API_URL}/admin/blog/${post.id}` : `${API_URL}/admin/blog`
    const payload = {
      ...form,
      status: status || form.status,
      cover_image: mediaFiles[0]?.url || form.cover_image || '',
    }
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (res.ok) onSave()
    } catch {}
    setSaving(false)
  }

  const insertMarkdown = (prefix, suffix = '') => {
    const ta = bodyRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = form.body.substring(start, end)
    const updated = form.body.substring(0, start) + prefix + selected + suffix + form.body.substring(end)
    setForm({ ...form, body: updated })
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length) }, 0)
  }

  const insertMediaUrl = (url) => {
    const isVideo = /\.(mp4|webm|mov)$/i.test(url)
    const markdown = isVideo ? `\n<video src="${url}" controls style="max-width:100%"></video>\n` : `\n![image](${url})\n`
    insertMarkdown(markdown)
    setShowMedia(false)
  }

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main editor - left 2/3 */}
      <div className="lg:col-span-2 space-y-5">
        {/* Title + Slug */}
        <div style={card} className="p-5">
          <div className="mb-4">
            <label style={labelStyle}>{t('admin.blog_title')}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
              style={{ ...inputStyle, fontSize: '20px', fontWeight: '700', padding: '14px' }} placeholder="Post title..." />
          </div>
          <div>
            <label style={labelStyle}>Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} placeholder="post-url-slug" />
          </div>
        </div>

        {/* Excerpt */}
        <div style={card} className="p-5">
          <label style={labelStyle}>{t('admin.blog_excerpt')}</label>
          <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            style={{ ...inputStyle, resize: 'none' }} placeholder="Short summary for previews..." />
        </div>

        {/* Body editor */}
        <div style={card} className="p-5">
          <label style={labelStyle}>{t('admin.editor_content')}</label>

          {/* Toolbar */}
          <div className="flex items-center gap-1 mb-3 p-2 flex-wrap" style={{ backgroundColor: dark ? '#0F0F14' : '#F5F5F5', borderRadius: '8px' }}>
            {[
              { label: 'B', action: () => insertMarkdown('**', '**'), title: 'Bold' },
              { label: 'I', action: () => insertMarkdown('*', '*'), title: 'Italic' },
              { label: 'H2', action: () => insertMarkdown('\n## ', '\n'), title: 'Heading 2' },
              { label: 'H3', action: () => insertMarkdown('\n### ', '\n'), title: 'Heading 3' },
              { label: 'Link', action: () => insertMarkdown('[', '](url)'), title: 'Link' },
              { label: 'Quote', action: () => insertMarkdown('\n> ', '\n'), title: 'Blockquote' },
              { label: 'List', action: () => insertMarkdown('\n- ', '\n'), title: 'List' },
            ].map((btn) => (
              <button key={btn.label} type="button" onClick={btn.action} title={btn.title}
                className="px-2.5 py-1.5 text-xs font-semibold transition-colors"
                style={{ color: dark ? '#AAA' : '#666', cursor: 'pointer', borderRadius: '6px' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = dark ? '#1a1a1a' : '#E8E8EC' }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}>
                {btn.label}
              </button>
            ))}
            <div className="w-px h-5 mx-1" style={{ backgroundColor: dark ? '#222' : '#DDD' }} />
            <button type="button" onClick={() => setShowMedia(!showMedia)}
              className="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: 'var(--accent)', cursor: 'pointer', borderRadius: '6px' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              {t('admin.editor_add_image')}
            </button>
          </div>

          {/* Inline media uploader */}
          {showMedia && (
            <div className="mb-3 p-3" style={{ backgroundColor: dark ? '#0F0F14' : '#F5F5F5', borderRadius: '8px' }}>
              <MediaUploader files={[]} onChange={(files) => { if (files.length > 0) insertMediaUrl(files[files.length - 1].url) }} maxFiles={1} folder="blog" />
              <p className="text-xs mt-2" style={{ color: dark ? '#555' : '#999' }}>
                Upload then click to insert into post body
              </p>
            </div>
          )}

          <textarea ref={bodyRef} id="blog-body" rows={16} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: '1.6' }}
            placeholder="Write your post in Markdown..." />
        </div>
      </div>

      {/* Sidebar - right 1/3 */}
      <div className="space-y-5">
        {/* Actions */}
        <div style={card} className="p-5 space-y-3">
          <button onClick={() => handleSave('published')} disabled={saving}
            className="w-full py-3 text-xs uppercase tracking-wider font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--accent-gradient)', color: '#FFF', cursor: 'pointer', borderRadius: '9999px' }}>
            {saving ? '...' : t('admin.editor_publish')}
          </button>
          <button onClick={() => handleSave('draft')} disabled={saving}
            className="w-full py-3 text-xs uppercase tracking-wider font-medium transition-colors"
            style={{ border: `1px solid ${dark ? '#333' : '#DDD'}`, color: dark ? '#AAA' : '#666', cursor: 'pointer', borderRadius: '9999px' }}>
            {t('admin.editor_save_draft')}
          </button>
          <button onClick={onCancel}
            className="w-full py-2.5 text-xs font-medium transition-colors"
            style={{ color: dark ? '#666' : '#999', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>

        {/* Cover Image */}
        <div style={card} className="p-5">
          <label style={labelStyle}>{t('admin.editor_cover_image')}</label>
          <MediaUploader files={mediaFiles} onChange={setMediaFiles} maxFiles={1} folder="blog" />
        </div>

        {/* Language */}
        <div style={card} className="p-5">
          <label style={labelStyle}>{t('admin.editor_language')}</label>
          <select value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })} style={inputStyle}>
            <option value="fr">Francais</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Status */}
        <div style={card} className="p-5">
          <label style={labelStyle}>{t('admin.blog_status')}</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
            <option value="draft">{t('admin.blog_draft')}</option>
            <option value="published">{t('admin.blog_published')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default function AdminBlog() {
  const { t } = useTranslation()
  const { dark } = useTheme()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const fetchPosts = () => {
    const token = localStorage.getItem('admin-token')
    fetch(`${API_URL}/admin/blog`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { if (isAdminLoggedIn()) fetchPosts() }, [])

  const handleDelete = async (id) => {
    if (!confirm(t('admin.blog_confirm_delete'))) return
    const token = localStorage.getItem('admin-token')
    await fetch(`${API_URL}/admin/blog/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchPosts()
  }

  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" replace />

  const card = { backgroundColor: dark ? '#141414' : '#FAFAFA', border: `1px solid ${dark ? '#1a1a1a' : '#E8E8EC'}`, borderRadius: '12px' }

  if (editing !== null) {
    const post = editing === 'new' ? null : posts.find((p) => p.id === editing)
    return (
      <div className="min-h-screen" style={{ backgroundColor: dark ? '#0D0D0D' : '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link to="/admin" className="text-xs uppercase tracking-wider mb-2 inline-block" style={{ color: 'var(--accent)' }}>
              {t('admin.dashboard')}
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>
              {post ? t('admin.blog_edit_post') : t('admin.blog_new_post')}
            </h1>
          </div>
          <PostEditor post={post} onSave={() => { setEditing(null); fetchPosts() }} onCancel={() => setEditing(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: dark ? '#0D0D0D' : '#FFFFFF' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs uppercase tracking-wider mb-2 inline-block" style={{ color: 'var(--accent)' }}>
              {t('admin.dashboard')}
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>
              {t('admin.blog_management')}
            </h1>
            <p className="text-sm mt-1" style={{ color: dark ? '#666' : '#888' }}>
              {t('admin.blog_management_desc')}
            </p>
          </div>
          <button onClick={() => setEditing('new')}
            className="text-xs px-5 py-2.5 uppercase tracking-wider font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--accent-gradient)', color: '#FFF', cursor: 'pointer', borderRadius: '9999px' }}>
            + {t('admin.blog_new_post')}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 rounded-xl" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20" style={card}>
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke={dark ? '#333' : '#DDD'} strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <p className="text-sm" style={{ color: dark ? '#666' : '#888' }}>
              {t('admin.blog_no_posts')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 transition-all"
                style={card}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = dark ? '#1a1a1a' : '#E8E8EC' }}>
                {post.cover_image ? (
                  <img src={post.cover_image} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: dark ? '#1a1a1a' : '#F0F0F0' }}>
                    <svg className="w-6 h-6" fill="none" stroke={dark ? '#333' : '#CCC'} strokeWidth="1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>{post.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: dark ? '#555' : '#999' }}>
                    {post.slug} &middot; {post.lang.toUpperCase()} &middot;
                    <span style={{ color: post.status === 'published' ? '#4ADE80' : '#FCD34D' }}> {post.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(post.id)} className="text-xs px-3 py-1.5 transition-colors"
                    style={{ border: `1px solid ${dark ? '#333' : '#DDD'}`, color: dark ? '#AAA' : '#666', cursor: 'pointer', borderRadius: '8px' }}>
                    {t('admin.edit')}
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="text-xs px-3 py-1.5 transition-colors"
                    style={{ border: '1px solid #450A0A', color: '#F87171', cursor: 'pointer', borderRadius: '8px' }}>
                    {t('admin.blog_delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
