import { useState, useEffect } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '../lib/animations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const defaultSections = [
  { title: 'about.values_title', description: 'about.values_desc', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
  { title: 'about.team_title', description: 'about.team_desc', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { title: 'about.mission_title', description: 'about.mission_desc', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
]

export default function AboutPage() {
  const { t, lang } = useTranslation()
  const [page, setPage] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/pages/about?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => { setPage(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [lang])

  const tag = page?.tag || t('about.tag')
  const title = page?.title || t('about.title')
  const subtitle = page?.subtitle || t('about.subtitle')
  const sections = page?.sections?.length ? page.sections : null

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      <section className="py-12" style={{ backgroundColor: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)' }}>
            {tag}
          </p>
          <h1 className="text-3xl mb-2 font-bold" style={{  color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial="hidden" animate="visible" variants={stagger}>
          {(sections || defaultSections).map((item, i) => {
            const itemTitle = item.title?.startsWith('about.') ? t(item.title) : (item.title || '')
            const itemDesc = item.description?.startsWith('about.') ? t(item.description) : (item.description || '')
            const icon = item.icon || defaultSections[i % defaultSections.length].icon
            return (
              <motion.div key={i} variants={fadeInUp} transition={{ duration: 0.5 }}
                className="p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                  <svg className="w-7 h-7" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{  color: 'var(--text-primary)' }}>
                  {itemTitle}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>
                  {itemDesc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>
    </div>
  )
}
