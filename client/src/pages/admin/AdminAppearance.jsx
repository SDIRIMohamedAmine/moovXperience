import { useTranslation } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { palettePresets } from '../../theme/colors'
import { isAdminLoggedIn } from '../../services/adminService'
import { Navigate, Link } from 'react-router-dom'

// OKLCH conversion utilities
function hexToLinearSrgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return [toLinear(r), toLinear(g), toLinear(b)]
}

function linearSrgbToOklch([r, g, b]) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const lC = Math.cbrt(l), mC = Math.cbrt(m), sC = Math.cbrt(s)
  const L = 0.2104542553 * lC + 0.7936177850 * mC - 0.0040720468 * sC
  const a = 1.9779984951 * lC - 2.4285922050 * mC + 0.4505937099 * sC
  const bk = 0.0259040371 * lC + 0.7827717662 * mC - 0.8086757660 * sC
  const C = Math.sqrt(a * a + bk * bk)
  let h = Math.atan2(bk, a) * 180 / Math.PI
  if (h < 0) h += 360
  return [L, C, h]
}

function hexToOklch(hex) {
  return linearSrgbToOklch(hexToLinearSrgb(hex))
}

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
                style={{ background: (() => {
                  const [l1, c1, h1] = hexToOklch(preset.accent)
                  const [l2, c2, h2] = hexToOklch(preset.secondary)
                  const [l3, c3, h3] = hexToOklch(preset.tertiary)
                  return `linear-gradient(90deg in oklch, oklch(${(l1*100).toFixed(1)}% ${c1.toFixed(3)} ${h1.toFixed(1)}), oklch(${(l2*100).toFixed(1)}% ${c2.toFixed(3)} ${h2.toFixed(1)}), oklch(${(l3*100).toFixed(1)}% ${c3.toFixed(3)} ${h3.toFixed(1)}))`
                })() }} />
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
