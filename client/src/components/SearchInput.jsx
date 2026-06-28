import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchProducts } from '../services/productService'

export default function SearchInput({ value, onChange, placeholder, mode, className = '' }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  // Fetch suggestions when input changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value || value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true)
      const filters = { search: value, limit: 5 }
      if (mode) filters.mode = mode

      fetchProducts(filters)
        .then((data) => {
          const products = data.products || []
          setSuggestions(products)
          setShowSuggestions(products.length > 0)
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [value, mode])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((productName) => {
    onChange(productName)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [onChange])

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
        autoComplete="off"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center transition-colors"
          style={{ cursor: 'pointer', borderRadius: '50%', background: 'var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--text-muted)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--border)' }}
          aria-label="Clear search"
        >
          <svg className="w-3 h-3" fill="none" stroke="var(--bg)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product.name)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-bg)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {product.images?.[0] ? (
                <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--bg)' }} />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                {product.price_per_day > 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {product.price_per_day} DT/{product.mode === 'sale' ? '' : 'jour'}
                  </p>
                )}
              </div>
            </button>
          ))}
          {loading && (
            <div className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              ...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
