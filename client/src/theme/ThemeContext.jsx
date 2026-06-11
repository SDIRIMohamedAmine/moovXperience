/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const lightColors = {
  bg: '#0D0D0D',
  bgWhite: '#141414',
  primary: '#FFFFFF',
  accent: '#D23AB0',
  accentLight: 'rgba(210,58,176,0.1)',
  accentGradient: 'linear-gradient(135deg, #D23AB0 0%, #AE59CE 50%, #7B61FF 100%)',
  cta: '#D23AB0',
  ctaHover: '#BD33A0',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textLight: '#666666',
  textWhite: '#FFFFFF',
  textMuted: '#666666',
  border: '#222222',
  headerBg: '#0D0D0D',
  footerBg: '#0A0A0A',
  inputBorder: '#222222',
  inputFocus: '#D23AB0',
  errorBg: '#3D1515',
  errorText: '#FF6B6B',
  errorBorder: '#5D2A2A',
  successBg: '#152D1A',
  successText: '#4CAF50',
  successBorder: '#2A5D2A',
  divider: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.6)',
}

const darkColors = {
  bg: '#0D0D0D',
  bgWhite: '#141414',
  primary: '#FFFFFF',
  accent: '#D23AB0',
  accentLight: 'rgba(210,58,176,0.12)',
  accentGradient: 'linear-gradient(135deg, #D23AB0 0%, #AE59CE 50%, #7B61FF 100%)',
  cta: '#D23AB0',
  ctaHover: '#BD33A0',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textLight: '#666666',
  textWhite: '#FFFFFF',
  textMuted: '#666666',
  border: '#222222',
  headerBg: '#0D0D0D',
  footerBg: '#0A0A0A',
  inputBorder: '#222222',
  inputFocus: '#D23AB0',
  errorBg: '#3D1515',
  errorText: '#FF6B6B',
  errorBorder: '#5D2A2A',
  successBg: '#152D1A',
  successText: '#4CAF50',
  successBorder: '#2A5D2A',
  divider: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.6)',
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark'
    } catch {
      return false
    }
  })

  const toggleTheme = () => setDark((prev) => !prev)

  useEffect(() => {
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch { /* noop */ }
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const colors = dark ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
