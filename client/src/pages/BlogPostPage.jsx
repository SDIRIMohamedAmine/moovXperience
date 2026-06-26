import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function estimateReadingTime(text) {
  if (!text) return 1
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

function renderMarkdown(md) {
  if (!md) return ''
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-8"><img src="$2" alt="$1" style="max-width:100%;border-radius:12px" loading="lazy" /><figcaption class="text-xs mt-2 text-center" style="color:var(--text-muted)">$1</figcaption></figure>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;text-underline-offset:3px">$1</a>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--accent);padding-left:1.5rem;margin:1.5rem 0;font-style:italic;color:var(--text-secondary)">$1</blockquote>')
    // Video tags (passthrough)
    .replace(/<video /g, '<video style="max-width:100%;border-radius:12px" ')
    // Horizontal rules
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:2rem 0" />')
    // Paragraphs
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('<')) return block
      return `<p>${block}</p>`
    })
    .join('\n')

  return html
}

export default function BlogPostPage() {
  const { t, lang } = useTranslation()
  const { dark } = useTheme()
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/blog/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setPost(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <div className="animate-pulse">
          <div className="h-72 md:h-96" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0' }} />
          <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
            <div className="h-4 w-32 rounded" style={{ backgroundColor: dark ? '#1a1a1a' : '#E8E8EC' }} />
            <div className="h-10 w-3/4 rounded" style={{ backgroundColor: dark ? '#1a1a1a' : '#E8E8EC' }} />
            <div className="h-4 w-full rounded" style={{ backgroundColor: dark ? '#1a1a1a' : '#E8E8EC' }} />
            <div className="h-4 w-2/3 rounded" style={{ backgroundColor: dark ? '#1a1a1a' : '#E8E8EC' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <svg className="w-8 h-8" fill="none" stroke="var(--accent)" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Post not found</p>
          <Link to="/blog" className="text-sm inline-flex items-center gap-2 transition-colors"
            style={{ color: 'var(--accent)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('blog_admin.back_to_blog')}
          </Link>
        </div>
      </div>
    )
  }

  const readTime = estimateReadingTime(post.body)
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero image */}
      {post.cover_image && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          className="relative w-full h-64 md:h-96 overflow-hidden" style={{ backgroundColor: 'var(--bg-overlay)' }}>
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to top, ${dark ? 'rgba(15,15,20,0.8)' : 'rgba(255,255,255,0.8)'} 0%, transparent 60%)`,
          }} />
        </motion.div>
      )}

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: post.cover_image ? '-4rem' : '3rem', position: 'relative' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider mb-8 transition-colors"
            style={{ color: 'var(--accent)', fontWeight: '600' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('blog_admin.back_to_blog')}
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            {formattedDate && (
              <time className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formattedDate}
              </time>
            )}
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {readTime} {t('admin.editor_reading_time')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight"
            style={{  color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg md:text-xl leading-relaxed mb-10"
              style={{ color: 'var(--text-secondary)', fontWeight: 300, maxWidth: '60ch', lineHeight: '1.7' }}>
              {post.excerpt}
            </p>
          )}

          {/* Divider */}
          <div className="mb-10" style={{ borderTop: '1px solid var(--border)' }} />

          {/* Body */}
          <div className="blog-content"
            style={{
              color: 'var(--text-primary)',
              
              fontSize: '17px',
              lineHeight: '1.8',
              maxWidth: '65ch',
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
        </motion.div>
      </article>

      {/* Bottom spacing + back link */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--accent)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('blog_admin.back_to_blog')}
          </Link>
        </div>
      </div>

      {/* Blog content styles */}
      <style>{`
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
        }
        .blog-content p:first-of-type::first-letter {
          font-size: 3.5em;
          font-weight: 700;
          float: left;
          line-height: 0.85;
          margin-right: 0.1em;
          margin-top: 0.05em;
          color: var(--accent);
        }
        .blog-content strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        .blog-content a {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }
        .blog-content a:hover {
          opacity: 0.8;
        }
        .blog-content blockquote {
          font-size: 1.125rem;
          line-height: 1.7;
        }
        .blog-content ul, .blog-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content figure {
          margin: 2rem 0;
        }
        .blog-content figure img {
          display: block;
        }
        .blog-content video {
          display: block;
          margin: 2rem 0;
        }
        @media (max-width: 768px) {
          .blog-content p:first-of-type::first-letter {
            font-size: 2.5em;
          }
        }
      `}</style>
    </div>
  )
}
