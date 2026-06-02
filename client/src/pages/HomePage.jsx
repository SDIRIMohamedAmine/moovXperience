import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { colors } = useTheme()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: colors.primary, minHeight: '520px' }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              `radial-gradient(circle at 20% 80%, ${colors.accent} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${colors.cta} 0%, transparent 50%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <p
              className="text-xs uppercase tracking-[0.3em] mb-6"
              style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}
            >
              {t('home.tagline')}
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textWhite, fontWeight: 500 }}
            >
              {t('home.title_start')}{' '}
              <span style={{ color: colors.accent }}>{t('home.title_highlight')}</span>
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed mb-10 max-w-xl"
              style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}
            >
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="inline-block px-8 py-3.5 text-sm uppercase tracking-widest font-medium"
                style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = colors.ctaHover)}
                onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
              >
                {user ? t('home.cta_dashboard') : t('home.cta_start')}
              </Link>
              <Link
                to="/register"
                className="inline-block px-8 py-3.5 text-sm uppercase tracking-widest font-medium"
                style={{ border: `1px solid ${colors.overlay}`, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
                onMouseEnter={(e) => { e.target.style.borderColor = colors.accent; e.target.style.color = colors.accent }}
                onMouseLeave={(e) => { e.target.style.borderColor = colors.overlay; e.target.style.color = colors.textWhite }}
              >
                {t('home.cta_supplier')}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: colors.accent }} />
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {t('home.categories_tag')}
            </p>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 500 }}>
              {t('home.categories_title')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: t('home.cat_chairs'), desc: t('home.cat_chairs_desc'), icon: 'M4 16h16M4 8h16M4 12h16' },
              { name: t('home.cat_tables'), desc: t('home.cat_tables_desc'), icon: 'M3 10h18M3 14h18M5 6h14' },
              { name: t('home.cat_lighting'), desc: t('home.cat_lighting_desc'), icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
              { name: t('home.cat_decor'), desc: t('home.cat_decor_desc'), icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
            ].map((cat) => (
              <div
                key={cat.name}
                className="group cursor-pointer p-6 transition-all duration-300"
                style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.boxShadow = '0 4px 20px rgba(118,171,174,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ backgroundColor: colors.accentLight }}>
                  <svg className="w-6 h-6" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                  </svg>
                </div>
                <h3 className="text-lg mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
                  {cat.name}
                </h3>
                <p className="text-xs" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" style={{ backgroundColor: colors.bgWhite }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {t('home.how_tag')}
            </p>
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 500 }}>
              {t('home.how_title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: t('home.step1_title'), desc: t('home.step1_desc') },
              { step: '02', title: t('home.step2_title'), desc: t('home.step2_desc') },
              { step: '03', title: t('home.step3_title'), desc: t('home.step3_desc') },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.accent }}>
                  {item.step}
                </div>
                <h3 className="text-xl mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.primary, fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: colors.textSecondary, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: colors.accent, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('home.cta_bottom_tag')}
          </p>
          <h2 className="text-3xl md:text-4xl mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textWhite, fontWeight: 500 }}>
            {t('home.cta_bottom_title')}
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: colors.textLight, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('home.cta_bottom_desc')}
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 text-sm uppercase tracking-widest font-medium"
            style={{ backgroundColor: colors.cta, color: colors.textWhite, fontFamily: 'DM Sans, system-ui, sans-serif' }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = colors.ctaHover)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
          >
            {t('home.cta_bottom_btn')}
          </Link>
        </div>
      </section>
    </div>
  )
}
