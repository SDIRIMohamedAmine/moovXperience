import { useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '../lib/animations'

export default function ContactPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1000)
  }

  const inputStyle = {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      <section className="py-12" style={{ backgroundColor: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)' }}>
            {t('contact.tag')}
          </p>
          <h1 className="text-3xl mb-2 font-bold" style={{  color: 'var(--text-primary)' }}>
            {t('contact.title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {sent ? (
              <motion.div variants={fadeInUp} className="p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-bold" style={{  color: 'var(--text-primary)' }}>
                  {t('contact.success_msg')}
                </p>
              </motion.div>
            ) : (
              <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="p-8 space-y-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    {t('contact.name_label')}
                  </label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('contact.name_placeholder')}
                    className="w-full px-4 py-3 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    {t('contact.email_label')}
                  </label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('contact.email_placeholder')}
                    className="w-full px-4 py-3 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    {t('contact.message_label')}
                  </label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t('contact.message_placeholder')}
                    className="w-full px-4 py-3 text-sm resize-none" style={inputStyle} />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full py-3.5 text-xs uppercase tracking-wider font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)', cursor: 'pointer', borderRadius: '9999px' }}>
                  {sending ? t('contact.sending') : t('contact.send_btn')}
                </button>
              </motion.form>
            )}
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-lg font-bold mb-6" style={{  color: 'var(--text-primary)' }}>
                {t('contact.info_title')}
              </h3>
              <div className="space-y-5">
                {[
                  { icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75', text: t('contact.email') },
                  { icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z', text: t('contact.phone') },
                  { icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', text: t('contact.address') },
                  { icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', text: t('contact.hours') },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent-bg)' }}>
                      <svg className="w-5 h-5" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <p className="text-sm pt-2" style={{ color: 'var(--text-secondary)' }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
