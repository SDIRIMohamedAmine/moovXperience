/**
 * MoovXperience — Complete Color System
 *
 * Dark: Deep charcoal with vivid berry accents, inspired by evenia.fr
 * Light: Clean white with vivid berry/coral, professional and vibrant
 */

const brand = {
  berry: '#C41E5E',
  coral: '#FF5E6C',
  orange: '#FF7B3A',
  berryDark: '#A01849',
  coralDark: '#E04A58',
  orangeDark: '#E06A2E',
}

export const palettePresets = [
  { id: 'berry-blaze', accent: '#C41E5E', secondary: '#FF5E6C', tertiary: '#FF7B3A' },
  { id: 'charcoal', accent: '#6B7280', secondary: '#9CA3AF', tertiary: '#D1D5DB' },
  { id: 'pumpkin', accent: '#EA580C', secondary: '#F97316', tertiary: '#FB923C' },
  { id: 'coral-sunset', accent: '#E11D48', secondary: '#FB7185', tertiary: '#FDBA74' },
  { id: 'midnight-navy', accent: '#1E3A5F', secondary: '#3B82F6', tertiary: '#60A5FA' },
  { id: 'rose-rush', accent: '#BE185D', secondary: '#EC4899', tertiary: '#F472B6' },
  { id: 'chinese-black', accent: '#B91C1C', secondary: '#DC2626', tertiary: '#EF4444' },
  { id: 'pleasantly-purple', accent: '#7C3AED', secondary: '#A78BFA', tertiary: '#C4B5FD' },
  { id: 'indigo', accent: '#4F46E5', secondary: '#818CF8', tertiary: '#A5B4FC' },
]

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
}

function mixHex(hex1, hex2, amount) {
  const [r1, g1, b1] = [parseInt(hex1.slice(1, 3), 16), parseInt(hex1.slice(3, 5), 16), parseInt(hex1.slice(5, 7), 16)]
  const [r2, g2, b2] = [parseInt(hex2.slice(1, 3), 16), parseInt(hex2.slice(3, 5), 16), parseInt(hex2.slice(5, 7), 16)]
  return rgbToHex(r1 + (r2 - r1) * amount, g1 + (g2 - g1) * amount, b1 + (b2 - b1) * amount)
}

export function createPalette(preset, dark) {
  const { accent, secondary, tertiary } = preset
  const aRgb = hexToRgb(accent)

  // Tint backgrounds/borders toward the accent hue
  const darkBase = '#0F0F14'
  const lightBase = '#FFFFFF'

  if (dark) {
    const bg = mixHex(darkBase, accent, 0.06)
    const bgCard = mixHex('#1A1A22', accent, 0.07)
    const bgElevated = mixHex('#222230', accent, 0.08)
    const bgOverlay = mixHex('#0A0A0F', accent, 0.04)
    const bgInput = mixHex('#14141C', accent, 0.05)
    const bgHover = mixHex('#282838', accent, 0.10)
    return {
      bg, bgCard, bgElevated, bgOverlay, bgInput, bgHover,
      textPrimary: '#F5F5F7',
      textSecondary: mixHex('#A8A8B8', accent, 0.08),
      textMuted: mixHex('#6A6A7A', accent, 0.06),
      textOnAccent: '#FFFFFF',
      textInverse: darkBase,
      border: mixHex('#2A2A38', accent, 0.10),
      borderLight: mixHex('#3A3A4A', accent, 0.08),
      borderFocus: accent,
      divider: `rgba(255,255,255,0.07)`,
      accent,
      accentSecondary: secondary,
      accentTertiary: tertiary,
      accentBg: `rgba(${aRgb},0.14)`,
      accentGradient: `linear-gradient(135deg, ${accent} 0%, ${secondary} 50%, ${tertiary} 100%)`,
      accentGradientSubtle: `linear-gradient(135deg, rgba(${aRgb},0.18) 0%, rgba(${hexToRgb(tertiary)},0.10) 100%)`,
      heroGradient1: accent,
      heroGradient2: tertiary,
      heroGradient3: secondary,
      heroGridLine: 'rgba(255,255,255,0.05)',
      heroOverlay: `linear-gradient(to top, ${bg} 0%, transparent 100%)`,
      bentoGradient1: `linear-gradient(135deg, ${accent}22 0%, ${tertiary}11 100%)`,
      bentoGradient2: `linear-gradient(135deg, ${secondary}22 0%, ${accent}11 100%)`,
      bentoGradient3: `linear-gradient(135deg, ${tertiary}22 0%, ${secondary}11 100%)`,
      bentoGradient4: `linear-gradient(135deg, ${mixHex('#1a1a2e', accent, 0.08)} 0%, ${mixHex('#16213e', accent, 0.06)} 100%)`,
      statusPendingBg: '#422006',
      statusPendingText: '#FCD34D',
      statusAcceptedBg: '#052E16',
      statusAcceptedText: '#4ADE80',
      statusRefusedBg: '#450A0A',
      statusRefusedText: '#F87171',
      shadowSm: `0 1px 3px rgba(0,0,0,0.4)`,
      shadowMd: `0 4px 14px rgba(0,0,0,0.35)`,
      shadowLg: `0 8px 36px rgba(0,0,0,0.45)`,
      shadowAccent: `0 4px 28px ${accent}40`,
    }
  } else {
    const bg = mixHex(lightBase, accent, 0.02)
    const bgCard = mixHex('#FAFAFA', accent, 0.03)
    const bgElevated = mixHex('#F5F5F5', accent, 0.03)
    const bgOverlay = mixHex('#F5F5F5', accent, 0.02)
    const bgInput = mixHex('#FFFFFF', accent, 0.01)
    const bgHover = mixHex('#F0F0F0', accent, 0.04)
    return {
      bg, bgCard, bgElevated, bgOverlay, bgInput, bgHover,
      textPrimary: '#1A1A2E',
      textSecondary: mixHex('#4A4A5A', accent, 0.05),
      textMuted: mixHex('#8A8A9A', accent, 0.04),
      textOnAccent: '#FFFFFF',
      textInverse: lightBase,
      border: mixHex('#E8E8EC', accent, 0.06),
      borderLight: mixHex('#F0F0F4', accent, 0.04),
      borderFocus: accent,
      divider: `rgba(26,26,46,0.08)`,
      accent,
      accentSecondary: secondary,
      accentTertiary: tertiary,
      accentBg: `rgba(${aRgb},0.08)`,
      accentGradient: `linear-gradient(135deg, ${accent} 0%, ${secondary} 50%, ${tertiary} 100%)`,
      accentGradientSubtle: `linear-gradient(135deg, rgba(${aRgb},0.10) 0%, rgba(${hexToRgb(tertiary)},0.06) 100%)`,
      heroGradient1: accent,
      heroGradient2: tertiary,
      heroGradient3: secondary,
      heroGridLine: 'rgba(26,26,46,0.05)',
      heroOverlay: `linear-gradient(to top, ${bg} 0%, transparent 100%)`,
      bentoGradient1: `linear-gradient(135deg, rgba(${aRgb},0.08) 0%, rgba(${hexToRgb(tertiary)},0.05) 100%)`,
      bentoGradient2: `linear-gradient(135deg, rgba(${hexToRgb(secondary)},0.08) 0%, rgba(${aRgb},0.05) 100%)`,
      bentoGradient3: `linear-gradient(135deg, rgba(${hexToRgb(tertiary)},0.08) 0%, rgba(${hexToRgb(secondary)},0.05) 100%)`,
      bentoGradient4: `linear-gradient(135deg, ${mixHex('#F5F5F5', accent, 0.04)} 0%, ${mixHex('#E8E8EC', accent, 0.03)} 100%)`,
      statusPendingBg: '#FEF3C7',
      statusPendingText: '#92400E',
      statusAcceptedBg: '#D1FAE5',
      statusAcceptedText: '#065F46',
      statusRefusedBg: '#FEE2E2',
      statusRefusedText: '#991B1B',
      shadowSm: `0 1px 3px rgba(26,26,46,0.06)`,
      shadowMd: `0 4px 14px rgba(26,26,46,0.08)`,
      shadowLg: `0 8px 36px rgba(26,26,46,0.12)`,
      shadowAccent: `0 4px 28px ${accent}38`,
    }
  }
}

export const darkPalette = {
  // Backgrounds
  bg: '#0F0F14',
  bgCard: '#1A1A22',
  bgElevated: '#222230',
  bgOverlay: '#0A0A0F',
  bgInput: '#14141C',
  bgHover: '#282838',

  // Text
  textPrimary: '#F5F5F7',
  textSecondary: '#A8A8B8',
  textMuted: '#6A6A7A',
  textOnAccent: '#FFFFFF',
  textInverse: '#0F0F14',

  // Borders
  border: '#2A2A38',
  borderLight: '#3A3A4A',
  borderFocus: brand.berry,
  divider: 'rgba(255,255,255,0.07)',

  // Accent
  accent: brand.berry,
  accentSecondary: brand.coral,
  accentTertiary: brand.orange,
  accentBg: 'rgba(196,30,94,0.14)',
  accentGradient: `linear-gradient(135deg, ${brand.berry} 0%, ${brand.coral} 50%, ${brand.orange} 100%)`,
  accentGradientSubtle: `linear-gradient(135deg, rgba(196,30,94,0.18) 0%, rgba(255,123,58,0.10) 100%)`,

  // Hero
  heroGradient1: brand.berry,
  heroGradient2: brand.orange,
  heroGradient3: brand.coral,
  heroGridLine: 'rgba(255,255,255,0.05)',
  heroOverlay: 'linear-gradient(to top, #0F0F14 0%, transparent 100%)',

  // Bento cards
  bentoGradient1: `linear-gradient(135deg, ${brand.berry}22 0%, ${brand.orange}11 100%)`,
  bentoGradient2: `linear-gradient(135deg, ${brand.coral}22 0%, ${brand.berry}11 100%)`,
  bentoGradient3: `linear-gradient(135deg, ${brand.orange}22 0%, ${brand.coral}11 100%)`,
  bentoGradient4: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,

  // Status
  statusPendingBg: '#422006',
  statusPendingText: '#FCD34D',
  statusAcceptedBg: '#052E16',
  statusAcceptedText: '#4ADE80',
  statusRefusedBg: '#450A0A',
  statusRefusedText: '#F87171',

  // Shadows
  shadowSm: '0 1px 3px rgba(0,0,0,0.4)',
  shadowMd: '0 4px 14px rgba(0,0,0,0.35)',
  shadowLg: '0 8px 36px rgba(0,0,0,0.45)',
  shadowAccent: `0 4px 28px ${brand.berry}40`,
}

export const lightPalette = {
  // Backgrounds — clean white palette
  bg: '#FFFFFF',
  bgCard: '#FAFAFA',
  bgElevated: '#F5F5F5',
  bgOverlay: '#F5F5F5',
  bgInput: '#FFFFFF',
  bgHover: '#F0F0F0',

  // Text — deep charcoal tones
  textPrimary: '#1A1A2E',
  textSecondary: '#4A4A5A',
  textMuted: '#8A8A9A',
  textOnAccent: '#FFFFFF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E8E8EC',
  borderLight: '#F0F0F4',
  borderFocus: brand.berry,
  divider: 'rgba(26,26,46,0.08)',

  // Accent — vivid berry primary, coral and orange secondaries
  accent: brand.berry,
  accentSecondary: brand.coral,
  accentTertiary: brand.orange,
  accentBg: 'rgba(196,30,94,0.08)',
  accentGradient: `linear-gradient(135deg, ${brand.berry} 0%, ${brand.coral} 50%, ${brand.orange} 100%)`,
  accentGradientSubtle: `linear-gradient(135deg, rgba(196,30,94,0.10) 0%, rgba(255,123,58,0.06) 100%)`,

  // Hero — vivid berry-coral gradient
  heroGradient1: brand.berry,
  heroGradient2: brand.orange,
  heroGradient3: brand.coral,
  heroGridLine: 'rgba(26,26,46,0.05)',
  heroOverlay: 'linear-gradient(to top, #FFFFFF 0%, transparent 100%)',

  // Bento cards
  bentoGradient1: `linear-gradient(135deg, rgba(196,30,94,0.08) 0%, rgba(255,123,58,0.05) 100%)`,
  bentoGradient2: `linear-gradient(135deg, rgba(255,94,108,0.08) 0%, rgba(196,30,94,0.05) 100%)`,
  bentoGradient3: `linear-gradient(135deg, rgba(255,123,58,0.08) 0%, rgba(255,94,108,0.05) 100%)`,
  bentoGradient4: `linear-gradient(135deg, #F5F5F5 0%, #E8E8EC 100%)`,

  // Status
  statusPendingBg: '#FEF3C7',
  statusPendingText: '#92400E',
  statusAcceptedBg: '#D1FAE5',
  statusAcceptedText: '#065F46',
  statusRefusedBg: '#FEE2E2',
  statusRefusedText: '#991B1B',

  // Shadows
  shadowSm: '0 1px 3px rgba(26,26,46,0.06)',
  shadowMd: '0 4px 14px rgba(26,26,46,0.08)',
  shadowLg: '0 8px 36px rgba(26,26,46,0.12)',
  shadowAccent: '0 4px 28px rgba(196,30,94,0.22)',
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
