import { useTranslation } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { palettePresets } from '../../theme/colors'
import { isAdminLoggedIn } from '../../services/adminService'
import { Navigate, Link } from 'react-router-dom'

const presetNames = {
  'berry-blaze': 'admin.palette_berry_blaze',
  'charcoal': 'admin.palette_charcoal',
  'pumpkin': 'admin.palette_pumpkin',
  'coral-sunset': 'admin.palette_coral_sunset',
  'midnight-navy': 'admin.palette_midnight_navy',
  'rose-rush': 'admin.palette_rose_rush',
  'chinese-black': 'admin.palette_chinese_black',
  'pleasantly-purple': 'admin.palette_pleasantly_purple',
  'indigo': 'admin.palette_indigo',
}

function PaletteGrid({ title, activeId, onSelect }) {
  const { t } = useTranslation()

  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {palettePresets.map((preset) => {
          const isActive = activeId === preset.id
          return (
            <button key={preset.id} onClick={() => onSelect(preset.id)}
              className="group text-left p-5 transition-all relative"
              style={{
                backgroundColor: '#141414',
                border: `2px solid ${isActive ? preset.accent : '#1a1a1a'}`,
                cursor: 'pointer',
                borderRadius: '12px',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#333' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#1a1a1a' }}>
              {isActive && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${preset.accent}22`, color: preset.accent }}>
                  {t('admin.palette_active')}
                </span>
              )}
              <div className="flex gap-2 mb-4">
                {[preset.accent, preset.secondary, preset.tertiary].map((color, i) => (
                  <div key={i} className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}44` }} />
                ))}
              </div>
              <div className="w-full h-2 rounded-full mb-3"
                style={{ background: `linear-gradient(90deg, ${preset.accent}, ${preset.secondary}, ${preset.tertiary})` }} />
              <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                {t(presetNames[preset.id] || '')}
              </span>
              <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-opacity"
                style={{ backgroundColor: preset.accent, opacity: isActive ? 1 : 0 }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminAppearance() {
  const { t } = useTranslation()
  const { paletteDark, paletteLight, setPalette } = useTheme()

  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs uppercase tracking-wider mb-2 inline-block" style={{ color: 'var(--accent)' }}>
              {t('admin.dashboard')}
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              {t('admin.appearance')}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#666' }}>
              {t('admin.appearance_desc')}
            </p>
          </div>
        </div>

        <PaletteGrid
          title={t('admin.palette_dark_mode')}
          activeId={paletteDark}
          onSelect={(id) => setPalette(id, 'dark')}
        />

        <PaletteGrid
          title={t('admin.palette_light_mode')}
          activeId={paletteLight}
          onSelect={(id) => setPalette(id, 'light')}
        />
      </div>
    </div>
  )
}
