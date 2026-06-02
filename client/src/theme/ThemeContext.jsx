/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const lightColors = {
  bg: '#F5F5F5',
  bgWhite: '#FFFFFF',
  primary: '#303841',
  accent: '#76ABAE',
  accentLight: '#E8F4F5',
  cta: '#FF5722',
  ctaHover: '#E64A19',
  textPrimary: '#303841',
  textSecondary: '#5A6570',
  textLight: '#8A939B',
  textWhite: '#FFFFFF',
  textMuted: '#8A939B',
  border: '#E0E3E6',
  headerBg: '#303841',
  footerBg: '#303841',
  inputBorder: '#E0E3E6',
  inputFocus: '#76ABAE',
  errorBg: '#FFF3E0',
  errorText: '#E64A19',
  errorBorder: '#FFCCBC',
  successBg: '#E8F4F5',
  successText: '#303841',
  successBorder: '#76ABAE',
  divider: 'rgba(255,255,255,0.1)',
  overlay: 'rgba(255,255,255,0.2)',
}

const darkColors = {
  bg: '#1A1D23',
  bgWhite: '#22262E',
  primary: '#E0E3E6',
  accent: '#76ABAE',
  accentLight: '#1E2A2D',
  cta: '#FF5722',
  ctaHover: '#E64A19',
  textPrimary: '#E0E3E6',
  textSecondary: '#8A939B',
  textLight: '#5A6570',
  textWhite: '#FFFFFF',
  textMuted: '#5A6570',
  border: '#303841',
  headerBg: '#1A1D23',
  footerBg: '#1A1D23',
  inputBorder: '#303841',
  inputFocus: '#76ABAE',
  errorBg: '#3D2215',
  errorText: '#FF8A65',
  errorBorder: '#5D3A2A',
  successBg: '#1E2A2D',
  successText: '#76ABAE',
  successBorder: '#3D5A5E',
  divider: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.4)',
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
