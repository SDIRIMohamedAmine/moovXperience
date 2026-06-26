/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { applyPalette, palettePresets, createPalette } from './colors'

const ThemeContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const DEFAULT_PALETTE = 'berry-blaze'

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return true
    }
  })

  const [paletteDark, setPaletteDarkState] = useState(DEFAULT_PALETTE)
  const [paletteLight, setPaletteLightState] = useState(DEFAULT_PALETTE)
  const [loaded, setLoaded] = useState(false)

  // Fetch global palette settings on mount
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.palette_dark) setPaletteDarkState(data.palette_dark)
        if (data.palette_light) setPaletteLightState(data.palette_light)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  // Apply palette whenever dark mode or palette changes
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
    const currentId = dark ? paletteDark : paletteLight
    const preset = palettePresets.find((p) => p.id === currentId) || palettePresets[0]
    applyPalette(createPalette(preset, dark))
  }, [dark, paletteDark, paletteLight, loaded])

  const currentId = dark ? paletteDark : paletteLight
  const preset = palettePresets.find((p) => p.id === currentId) || palettePresets[0]
  const colors = createPalette(preset, dark)
  const toggle = () => setDark((d) => !d)

  const setPalette = async (id, mode) => {
    const key = mode === 'light' ? 'palette_light' : 'palette_dark'
    if (mode === 'light') setPaletteLightState(id)
    else setPaletteDarkState(id)

    try {
      const token = localStorage.getItem('admin-token')
      if (token) {
        await fetch(`${API_URL}/admin/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key, value: id }),
        })
      }
    } catch (err) {
      console.error('Failed to save palette:', err)
    }
  }

  return (
    <ThemeContext.Provider value={{
      dark, colors, toggle,
      paletteDark, paletteLight, setPalette,
      loaded,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
