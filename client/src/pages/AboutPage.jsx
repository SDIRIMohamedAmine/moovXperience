import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { motion } from 'framer-motion'
import { fadeInUp, stagger, viewportOnce } from '../lib/animations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function resolveText(text, t) {
  if (!text) return ''
  return text.startsWith('about.') ? t(text) : text
}

function StatsSection({ items }) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg-overlay)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12" initial="hidden" whileInView="visible" viewport={viewportOnce} variants={stagger}>
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2" style={{ color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                {item.value}
              </div>
              <div className="text-sm uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function MissionSection({ items }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial="hidden" whileInView="visible" viewport={viewportOnce} variants={stagger}>
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeInUp} className="p-8 text-center transition-all"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}
              whileHover={{ y: -4, borderColor: 'var(--accent)' }}>
              <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <svg className="w-7 h-7" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ServicesSection({ items }) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg-overlay)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="space-y-16 md:space-y-24" initial="hidden" whileInView="visible" viewport={viewportOnce} variants={stagger}>
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeInUp}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
              {item.image && (
                <div className="overflow-hidden md:[direction:ltr]" style={{ borderRadius: '16px' }}>
                  <img src={item.image} alt={item.title} className="w-full h-64 md:h-80 object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
                </div>
              )}
              <div className={item.image ? 'md:[direction:ltr]' : 'md:col-span-2'}>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ letterSpacing: '-0.01em' }}>{item.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', fontWeight: 300, lineHeight: '1.8', maxWidth: '55ch' }}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TeamSection({ items }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" initial="hidden" whileInView="visible" viewport={viewportOnce} variants={stagger}>
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center group">
              <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-4 overflow-hidden rounded-full" style={{ border: '2px solid var(--border)' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{(item.name || '?')[0]}</span>
                  </div>
                )}
              </div>
              <h4 className="text-sm font-bold mb-0.5">{item.name}</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CtaSection({ section }) {
  return (
    <section className="py-16 md:py-24" style={{ background: 'var(--accent-gradient-subtle)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={stagger}>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-8" style={{ letterSpacing: '-0.02em' }}>
            {section.title}
          </motion.h2>
          {section.button_text && (
            <motion.div variants={fadeInUp}>
              <Link to={section.button_link || '/contact'}
                className="inline-flex items-center gap-3 px-8 py-4 text-sm uppercase tracking-widest font-bold transition-all hover:scale-105"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', borderRadius: '9999px', boxShadow: '0 4px 24px rgba(196,30,94,0.35)' }}>
                {section.button_text}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

const sectionRenderers = { stats: StatsSection, mission: MissionSection, services: ServicesSection, team: TeamSection }

export default function AboutPage() {
  const { t, lang } = useTranslation()
  const { dark } = useTheme()
  const [page, setPage] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/pages/about?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => { setPage(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [lang])

  const tag = page?.tag || ''
  const title = page?.title || ''
  const subtitle = page?.subtitle || ''
  const coverImage = page?.cover_image
  const sections = page?.sections || []

  // If page has no content at all, show empty state
  const hasContent = tag || title || subtitle || sections.length > 0

  if (loaded && !hasContent) {
    return (
      <div style={{ backgroundColor: 'var(--bg)' }}>
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-6" fill="none" stroke="var(--border)" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('blog_admin.no_posts')}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {lang === 'fr' ? 'Configurez cette page depuis le panneau d\'administration.' : 'Configure this page from the admin panel.'}
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero — only renders if there's hero content */}
      {(tag || title || subtitle) && (
        <section className="relative overflow-hidden py-16 md:py-24" style={{ backgroundColor: 'var(--bg-overlay)' }}>
          {coverImage && (
            <div className="absolute inset-0">
              <img src={coverImage} alt="" className="w-full h-full object-cover" style={{ opacity: 0.15 }} />
            </div>
          )}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              {tag && <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-3 font-medium" style={{ color: 'var(--accent)' }}>{tag}</motion.p>}
              {title && <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>{title}</motion.h1>}
              {subtitle && <motion.p variants={fadeInUp} className="text-base md:text-lg max-w-2xl" style={{ color: 'var(--text-muted)', fontWeight: 300, lineHeight: '1.8' }}>{subtitle}</motion.p>}
            </motion.div>
          </div>
        </section>
      )}

      {/* Dynamic sections */}
      {sections.map((section, i) => {
        if (section.type === 'cta') return <CtaSection key={i} section={section} />
        const Renderer = sectionRenderers[section.type]
        if (!Renderer) return null
        return <Renderer key={i} items={section.items || []} />
      })}
    </div>
  )
}
