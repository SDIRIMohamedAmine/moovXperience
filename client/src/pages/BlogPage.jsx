import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.12 } } }

function estimateReadingTime(text) {
  if (!text) return 1
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

export default function BlogPage() {
  const { t, lang } = useTranslation()
  const { dark } = useTheme()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/blog?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => { setPosts(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [lang])

  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24" style={{ backgroundColor: 'var(--bg-overlay)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-3 font-medium"
              style={{ color: 'var(--accent)' }}>
              {t('blog_admin.title')}
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              style={{  color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {t('blog.title')}
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-base md:text-lg max-w-2xl"
              style={{ color: 'var(--text-muted)', fontWeight: 300, lineHeight: '1.7' }}>
              {t('blog_admin.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {loading ? (
          <div className="space-y-8">
            <div className="animate-pulse h-80 rounded-2xl" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0' }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-64 rounded-xl" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0' }} />
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <motion.div className="text-center py-24" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
            <motion.div variants={fadeInUp}>
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <svg className="w-10 h-10" fill="none" stroke="var(--accent)" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
              </div>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-xl font-bold mb-2" style={{  color: 'var(--text-primary)' }}>
              {t('blog_admin.no_posts')}
            </motion.h2>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Featured post */}
            {featured && (
              <motion.article variants={fadeInUp} transition={{ duration: 0.6 }} className="mb-12">
                <Link to={`/blog/${featured.slug}`} className="group block">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                    {featured.cover_image && (
                      <div className="overflow-hidden" style={{ borderRadius: '16px' }}>
                        <img src={featured.cover_image} alt={featured.title}
                          className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    )}
                    <div className={featured.cover_image ? '' : 'lg:col-span-2'}>
                      <span className="inline-block text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 mb-4"
                        style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: '9999px' }}>
                        {t('admin.featured')}
                      </span>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        {featured.published_at ? new Date(featured.published_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                        {featured.body ? ` \u00B7 ${estimateReadingTime(featured.body)} ${t('admin.editor_reading_time')}` : ''}
                      </p>
                      <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight transition-colors"
                        style={{  color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-sm md:text-base leading-relaxed mb-4"
                          style={{ color: 'var(--text-secondary)', fontWeight: 300, maxWidth: '55ch' }}>
                          {featured.excerpt}
                        </p>
                      )}
                      <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
                        style={{ color: 'var(--accent)' }}>
                        {t('blog_admin.read_more')}
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* Divider */}
            {rest.length > 0 && featured && (
              <div className="mb-12" style={{ borderTop: '1px solid var(--border)' }} />
            )}

            {/* Post grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {rest.map((post, index) => (
                  <motion.article key={post.id} variants={fadeInUp} transition={{ duration: 0.5, delay: index * 0.05 }}>
                    <Link to={`/blog/${post.slug}`} className="group block">
                      {post.cover_image && (
                        <div className="overflow-hidden mb-4" style={{ borderRadius: '12px' }}>
                          <img src={post.cover_image} alt={post.title}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy" />
                        </div>
                      )}
                      <p className="text-[10px] uppercase tracking-[0.15em] mb-2"
                        style={{ color: 'var(--text-muted)' }}>
                        {post.published_at ? new Date(post.published_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                        {post.body ? ` \u00B7 ${estimateReadingTime(post.body)} ${t('admin.editor_reading_time')}` : ''}
                      </p>
                      <h3 className="text-lg font-bold mb-2 leading-snug transition-colors"
                        style={{  color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm leading-relaxed mb-3 line-clamp-2"
                          style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>
                          {post.excerpt}
                        </p>
                      )}
                      <span className="text-xs uppercase tracking-wider font-semibold"
                        style={{ color: 'var(--accent)' }}>
                        {t('blog_admin.read_more')} &rarr;
                      </span>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  )
}
