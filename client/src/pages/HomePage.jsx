import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { fetchProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const solutions = (t) => [
  {
    key: 'photobooth',
    title: t('home.sol_photobooth'),
    desc: t('home.sol_photobooth_desc'),
    icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z',
    gradient: 'linear-gradient(135deg, #D23AB0 0%, #AE59CE 100%)',
  },
  {
    key: 'led_wall',
    title: t('home.sol_led_wall'),
    desc: t('home.sol_led_wall_desc'),
    icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z',
    gradient: 'linear-gradient(135deg, #7B61FF 0%, #AE59CE 100%)',
  },
  {
    key: 'bike',
    title: t('home.sol_bike'),
    desc: t('home.sol_bike_desc'),
    icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #D23AB0 100%)',
  },
  {
    key: 'borne',
    title: t('home.sol_borne'),
    desc: t('home.sol_borne_desc'),
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    gradient: 'linear-gradient(135deg, #AE59CE 0%, #7B61FF 100%)',
  },
  {
    key: 'quiz',
    title: t('home.sol_quiz'),
    desc: t('home.sol_quiz_desc'),
    icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z',
    gradient: 'linear-gradient(135deg, #D23AB0 0%, #FF6B6B 100%)',
  },
]

const useCases = (t) => [
  { key: 'corporate', title: t('home.use_case_corporate'), desc: t('home.use_case_corporate_desc') },
  { key: 'salons', title: t('home.use_case_salons'), desc: t('home.use_case_salons_desc') },
  { key: 'marketing', title: t('home.use_case_marketing'), desc: t('home.use_case_marketing_desc') },
  { key: 'private', title: t('home.use_case_private'), desc: t('home.use_case_private_desc') },
]

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    fetchProducts({ limit: 4 })
      .then((data) => setFeatured(data.products || []))
      .catch(() => {})
  }, [])

  const allSolutions = solutions(t)
  const allUseCases = useCases(t)

  return (
    <div style={{ backgroundColor: '#0D0D0D' }}>
      {/* Hero — full dark with gradient mesh */}
      <section className="relative overflow-hidden noise-overlay" style={{ minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
        {/* Gradient orbs */}
        <div className="absolute inset-0" style={{ opacity: 0.4 }}>
          <div className="absolute w-[800px] h-[800px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, #D23AB0 0%, transparent 70%)', top: '-30%', right: '-10%', animation: 'float1 20s ease-in-out infinite' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(circle, #7B61FF 0%, transparent 70%)', bottom: '-20%', left: '-10%', animation: 'float2 25s ease-in-out infinite' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{ background: 'radial-gradient(circle, #AE59CE 0%, transparent 70%)', top: '30%', left: '40%', animation: 'float3 18s ease-in-out infinite' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-44">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeInUp} custom={0}
                className="inline-block px-4 py-1.5 mb-8 text-xs uppercase tracking-[0.3em] font-medium"
                style={{ border: '1px solid rgba(210,58,176,0.4)', color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
                {t('home.tagline')}
              </motion.div>
              <motion.h1 variants={fadeInUp} custom={1}
                className="text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-8"
                style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', fontWeight: 800, letterSpacing: '-0.03em' }}>
                {t('home.title_start')}{' '}
                <span className="gradient-text">{t('home.title_highlight')}</span>
              </motion.h1>
              <motion.p variants={fadeInUp} custom={2}
                className="text-lg md:text-xl leading-relaxed mb-12 max-w-xl"
                style={{ color: '#A0A0A0', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                {t('home.subtitle')}
              </motion.p>
              <motion.div variants={fadeInUp} custom={3} className="flex flex-wrap gap-5">
                <Link
                  to={user ? '/dashboard' : '/catalog'}
                  className="group inline-flex items-center gap-3 px-8 py-4 text-sm uppercase tracking-widest font-semibold transition-all duration-300 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #D23AB0 0%, #AE59CE 100%)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                  {user ? t('home.cta_dashboard') : t('home.cta_start')}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-3 px-8 py-4 text-sm uppercase tracking-widest font-medium transition-all duration-300"
                  style={{ border: '1px solid #333', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D23AB0'; e.currentTarget.style.color = '#D23AB0' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#FFFFFF' }}>
                  {t('home.video_demo')}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero visual — floating cards */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:block relative">
              <div className="relative w-full h-[500px]">
                {/* Glowing orb behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px]"
                  style={{ background: 'radial-gradient(circle, rgba(210,58,176,0.4) 0%, transparent 70%)' }} />

                {/* Floating solution cards */}
                {allSolutions.slice(0, 3).map((sol, i) => (
                  <motion.div key={sol.key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.2 }}
                    className="absolute p-5 backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(20,20,20,0.8)',
                      border: '1px solid rgba(210,58,176,0.2)',
                      top: `${15 + i * 25}%`,
                      left: i === 1 ? '55%' : '10%',
                      width: '260px',
                      animation: `float${i + 1} ${15 + i * 3}s ease-in-out infinite`,
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: sol.gradient }}>
                        <svg className="w-4 h-4" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={sol.icon} />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                        {sol.title}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                      {sol.desc.slice(0, 80)}...
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to top, #0D0D0D, transparent)' }} />

        <style>{`
          @keyframes float1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,-30px)} 66%{transform:translate(-15px,15px)} }
          @keyframes float2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-30px,20px)} 66%{transform:translate(20px,-10px)} }
          @keyframes float3 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(15px,15px)} 50%{transform:translate(-10px,30px)} 75%{transform:translate(20px,-5px)} }
        `}</style>
      </section>

      {/* Trust stats — dark bar */}
      <section className="py-16 relative" style={{ backgroundColor: '#0A0A0A', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: '100+', label: t('home.trust_clients') },
              { value: '5', label: t('home.trust_solutions') },
              { value: '300+', label: t('home.trust_events') },
              { value: '3', label: t('home.trust_countries') },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeInUp} custom={i}>
                <div className="text-4xl md:text-5xl font-bold mb-2 gradient-text"
                  style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-[0.25em] font-medium"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solutions — grid with gradient borders */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className="text-center mb-16">
            <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-4 font-medium"
              style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
              {t('home.solutions_tag')}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {t('home.solutions_title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base mt-4 max-w-2xl mx-auto"
              style={{ color: '#666', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              {t('home.solutions_subtitle')}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allSolutions.map((sol) => (
              <motion.div key={sol.key} variants={scaleIn}
                className="group relative overflow-hidden transition-all duration-500 cursor-pointer"
                style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(210,58,176,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(210,58,176,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#1a1a1a'
                }}>
                {/* Gradient top bar */}
                <div className="h-1" style={{ background: sol.gradient }} />
                <div className="p-8">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: sol.gradient }}>
                    <svg className="w-7 h-7" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={sol.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl mb-3 font-bold"
                    style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
                    {sol.title}
                  </h3>
                  <p className="text-sm leading-relaxed"
                    style={{ color: '#666', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    {sol.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases — dark section with gradient accent */}
      <section className="py-24 relative noise-overlay" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className="text-center mb-16">
            <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-4 font-medium"
              style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
              {t('home.use_cases_tag')}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
              {t('home.use_cases_title')}
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allUseCases.map((uc, i) => (
              <motion.div key={uc.key} variants={fadeInUp} custom={i}
                className="group p-6 transition-all duration-300"
                style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D23AB0'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div className="w-3 h-3 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #D23AB0, #AE59CE)' }} />
                <h3 className="text-lg mb-2 font-bold"
                  style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
                  {uc.title}
                </h3>
                <p className="text-sm leading-relaxed"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  {uc.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className="text-center mb-16">
            <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-4 font-medium"
              style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
              {t('home.how_tag')}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
              {t('home.how_title')}
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #D23AB0, transparent)' }} />

            {[
              { step: '01', title: t('home.step1_title'), desc: t('home.step1_desc') },
              { step: '02', title: t('home.step2_title'), desc: t('home.step2_desc') },
              { step: '03', title: t('home.step3_title'), desc: t('home.step3_desc') },
            ].map((item, i) => (
              <motion.div key={item.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={i}
                className="text-center relative">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-2xl font-bold relative"
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    background: 'linear-gradient(135deg, #D23AB0 0%, #AE59CE 100%)',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    color: '#FFFFFF',
                  }}>
                  {item.step}
                </div>
                <h3 className="text-xl mb-3 font-bold"
                  style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto"
                  style={{ color: '#666', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-24 relative" style={{ backgroundColor: '#0A0A0A' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
              className="flex items-end justify-between mb-14">
              <div>
                <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-4 font-medium"
                  style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
                  {t('home.featured_tag')}
                </motion.p>
                <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold"
                  style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
                  {t('home.featured_title')}
                </motion.h2>
              </div>
              <Link to="/catalog" className="hidden md:inline-flex items-center gap-2 text-sm font-medium transition-colors group"
                style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
                {t('home.view_all')}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <motion.div key={product.id} variants={scaleIn}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA — full gradient section */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #D23AB0 0%, #7B61FF 50%, #AE59CE 100%)' }} />
        <div className="absolute inset-0 opacity-10 noise-overlay" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] mb-5 font-medium"
            style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif' }}>
            {t('home.cta_bottom_tag')}
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl mb-8 font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {t('home.cta_bottom_title')}
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg leading-relaxed mb-12 max-w-lg mx-auto"
            style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
            {t('home.cta_bottom_desc')}
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 px-10 py-5 text-sm uppercase tracking-widest font-bold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#FFFFFF', color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
              {t('home.cta_bottom_btn')}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
