import { useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../theme/ThemeContext'
import { useTranslation } from '../i18n/LanguageContext'

// Fix Leaflet default marker icons (webpack/vite issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TUNIS_CENTER = [36.8065, 10.1815]

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyToLocation({ position }) {
  const map = useMap()
  if (position) {
    map.flyTo(position, 15, { duration: 1 })
  }
  return null
}

function SearchBox({ onSelect }) {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const timerRef = useRef(null)

  const handleSearch = useCallback((value) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (value.length < 3) {
      setResults([])
      return
    }

    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&accept-language=fr&countrycodes=tn,fr,dz,ma,ly`
        )
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 1000)
  }, [])

  const handleSelect = (result) => {
    setQuery(result.display_name)
    setResults([])
    onSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name)
  }

  return (
    <div className="relative mb-2">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke={colors.textLight} strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('checkout.search_location')}
          className="w-full pl-9 pr-4 py-2.5 text-sm"
          style={{ border: `1px solid ${colors.border}`, color: colors.primary,  backgroundColor: colors.bgWhite }}
          onFocus={(e) => (e.target.style.borderColor = colors.accent)}
          onBlur={(e) => setTimeout(() => (e.target.style.borderColor = colors.border), 200)}
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-[1000] w-full mt-1 max-h-48 overflow-y-auto shadow-lg"
          style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }}>
          {results.map((result, i) => (
            <button key={i}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-3 py-2 text-sm transition-colors"
              style={{ color: colors.primary,  borderBottom: `1px solid ${colors.border}` }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = colors.accentLight)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}>
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LocationPicker({ value, onChange }) {
  const { colors } = useTheme()
  const [position, setPosition] = useState(value?.lat ? [value.lat, value.lng] : null)

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }

  const handleLocationSelect = async (lat, lng, text) => {
    setPosition([lat, lng])
    const address = text || await reverseGeocode(lat, lng)
    onChange({ text: address, lat, lng })
  }

  return (
    <div>
      <SearchBox onSelect={handleLocationSelect} />

      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
        <MapContainer
          center={position || TUNIS_CENTER}
          zoom={position ? 14 : 6}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <FlyToLocation position={position} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {value?.text && (
        <div className="mt-2 flex items-start gap-2 px-3 py-2" style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}` }}>
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke={colors.accent} strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="text-sm" style={{ color: colors.primary,  }}>
            {value.text}
          </span>
        </div>
      )}
    </div>
  )
}
