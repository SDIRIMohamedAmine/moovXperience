/**
 * MoovXperience — Complete Color System
 *
 * Dark: Deep charcoal with magenta accents, inspired by event/nightlife aesthetic
 * Light: Warm off-white with rich magenta, professional yet vibrant
 */

const brand = {
  magenta: '#D23AB0',
  purple: '#AE59CE',
  violet: '#7B61FF',
  magentaDark: '#B02D8F',
  purpleDark: '#8E3FAF',
  violetDark: '#5A3FCC',
}

export const darkPalette = {
  // Backgrounds
  bg: '#09090B',
  bgCard: '#141416',
  bgElevated: '#1C1C1F',
  bgOverlay: '#060608',
  bgInput: '#111113',
  bgHover: '#1F1F23',

  // Text
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textOnAccent: '#FFFFFF',
  textInverse: '#09090B',

  // Borders
  border: '#27272A',
  borderLight: '#3F3F46',
  borderFocus: brand.magenta,
  divider: 'rgba(255,255,255,0.06)',

  // Accent
  accent: brand.magenta,
  accentSecondary: brand.purple,
  accentTertiary: brand.violet,
  accentBg: 'rgba(210,58,176,0.12)',
  accentGradient: `linear-gradient(135deg, ${brand.magenta} 0%, ${brand.purple} 50%, ${brand.violet} 100%)`,
  accentGradientSubtle: `linear-gradient(135deg, rgba(210,58,176,0.15) 0%, rgba(123,97,255,0.08) 100%)`,

  // Hero
  heroGradient1: brand.magenta,
  heroGradient2: brand.violet,
  heroGradient3: brand.purple,
  heroGridLine: 'rgba(255,255,255,0.05)',
  heroOverlay: 'linear-gradient(to top, #09090B 0%, transparent 100%)',

  // Bento cards
  bentoGradient1: `linear-gradient(135deg, ${brand.magenta}22 0%, ${brand.violet}11 100%)`,
  bentoGradient2: `linear-gradient(135deg, ${brand.violet}22 0%, ${brand.purple}11 100%)`,
  bentoGradient3: `linear-gradient(135deg, ${brand.purple}22 0%, ${brand.magenta}11 100%)`,
  bentoGradient4: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,

  // Status
  statusPendingBg: '#422006',
  statusPendingText: '#FCD34D',
  statusAcceptedBg: '#052E16',
  statusAcceptedText: '#4ADE80',
  statusRefusedBg: '#450A0A',
  statusRefusedText: '#F87171',

  // Shadows
  shadowSm: '0 1px 2px rgba(0,0,0,0.4)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.3)',
  shadowLg: '0 8px 32px rgba(0,0,0,0.4)',
  shadowAccent: `0 4px 24px ${brand.magenta}33`,
}

export const lightPalette = {
  // Backgrounds — warm cream palette
  bg: '#F7F1DE',
  bgCard: '#FFFCF5',
  bgElevated: '#EDE7D0',
  bgOverlay: '#EDE7D0',
  bgInput: '#FFFCF5',
  bgHover: '#EDE7D0',

  // Text — dark brown tones
  textPrimary: '#4E220F',
  textSecondary: '#7A5C3E',
  textMuted: '#A89078',
  textOnAccent: '#FFFFFF',
  textInverse: '#F7F1DE',

  // Borders
  border: '#D4C9B0',
  borderLight: '#C2B89E',
  borderFocus: '#9D6638',
  divider: 'rgba(78,34,15,0.08)',

  // Accent — brown primary, sage green secondary
  accent: '#9D6638',
  accentSecondary: '#B0BA99',
  accentTertiary: '#7A5C3E',
  accentBg: 'rgba(157,102,56,0.10)',
  accentGradient: 'linear-gradient(135deg, #9D6638 0%, #B0BA99 100%)',
  accentGradientSubtle: 'linear-gradient(135deg, rgba(157,102,56,0.08) 0%, rgba(176,186,153,0.06) 100%)',

  // Hero — warm brown-green gradient
  heroGradient1: '#9D6638',
  heroGradient2: '#B0BA99',
  heroGradient3: '#7A5C3E',
  heroGridLine: 'rgba(78,34,15,0.06)',
  heroOverlay: 'linear-gradient(to top, #F7F1DE 0%, transparent 100%)',

  // Bento cards
  bentoGradient1: 'linear-gradient(135deg, rgba(157,102,56,0.10) 0%, rgba(176,186,153,0.06) 100%)',
  bentoGradient2: 'linear-gradient(135deg, rgba(176,186,153,0.10) 0%, rgba(122,92,62,0.06) 100%)',
  bentoGradient3: 'linear-gradient(135deg, rgba(122,92,62,0.10) 0%, rgba(157,102,56,0.06) 100%)',
  bentoGradient4: 'linear-gradient(135deg, #EDE7D0 0%, #D4C9B0 100%)',

  // Status
  statusPendingBg: '#FEF3C7',
  statusPendingText: '#92400E',
  statusAcceptedBg: '#D1FAE5',
  statusAcceptedText: '#065F46',
  statusRefusedBg: '#FEE2E2',
  statusRefusedText: '#991B1B',

  // Shadows
  shadowSm: '0 1px 2px rgba(78,34,15,0.06)',
  shadowMd: '0 4px 12px rgba(78,34,15,0.08)',
  shadowLg: '0 8px 32px rgba(78,34,15,0.12)',
  shadowAccent: '0 4px 24px rgba(157,102,56,0.20)',
}

/**
 * Apply full palette as CSS variables
 */
export function applyPalette(palette) {
  const root = document.documentElement
  const vars = {
    // Backgrounds
    '--bg': palette.bg,
    '--bg-card': palette.bgCard,
    '--bg-elevated': palette.bgElevated,
    '--bg-overlay': palette.bgOverlay,
    '--bg-input': palette.bgInput,
    '--bg-hover': palette.bgHover,

    // Text
    '--text-primary': palette.textPrimary,
    '--text-secondary': palette.textSecondary,
    '--text-muted': palette.textMuted,
    '--text-on-accent': palette.textOnAccent,
    '--text-inverse': palette.textInverse,

    // Borders
    '--border': palette.border,
    '--border-light': palette.borderLight,
    '--border-focus': palette.borderFocus,
    '--divider': palette.divider,

    // Accent
    '--accent': palette.accent,
    '--accent-secondary': palette.accentSecondary,
    '--accent-tertiary': palette.accentTertiary,
    '--accent-bg': palette.accentBg,
    '--accent-gradient': palette.accentGradient,
    '--accent-gradient-subtle': palette.accentGradientSubtle,

    // Hero
    '--hero-1': palette.heroGradient1,
    '--hero-2': palette.heroGradient2,
    '--hero-3': palette.heroGradient3,
    '--hero-grid': palette.heroGridLine,
    '--hero-overlay': palette.heroOverlay,

    // Bento
    '--bento-1': palette.bentoGradient1,
    '--bento-2': palette.bentoGradient2,
    '--bento-3': palette.bentoGradient3,
    '--bento-4': palette.bentoGradient4,

    // Status
    '--status-pending-bg': palette.statusPendingBg,
    '--status-pending-text': palette.statusPendingText,
    '--status-accepted-bg': palette.statusAcceptedBg,
    '--status-accepted-text': palette.statusAcceptedText,
    '--status-refused-bg': palette.statusRefusedBg,
    '--status-refused-text': palette.statusRefusedText,

    // Shadows
    '--shadow-sm': palette.shadowSm,
    '--shadow-md': palette.shadowMd,
    '--shadow-lg': palette.shadowLg,
    '--shadow-accent': palette.shadowAccent,
  }
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}
