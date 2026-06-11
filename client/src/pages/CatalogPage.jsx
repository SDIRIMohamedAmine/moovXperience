import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { fetchProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/Skeleton'

const categoryLabels = {
  'gamification-interactive': 'Gamification Interactive',
  'marketing-activation': 'Marketing & Activation',
  'materiel-evenementiel': 'Matériel Événementiel',
  'photo-video': 'Photo & Vidéo',
  'son-eclairage': 'Son & Éclairage',
  'decoration-mobilier': 'Décoration & Mobilier',
  'animation-spectacle': 'Animation & Spectacle',
  'traiteur-restauration': 'Traiteur & Restauration',
}

const pricingLabels = {
  fixed: 'Prix fixe',
  negotiable: 'Négociable',
  suggestion: 'Suggestion de prix',
}

export default function CatalogPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedPricing, setSelectedPricing] = useState(searchParams.get('pricing') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const filters = {}
    if (search) filters.search = search
    if (selectedCategory) filters.category = selectedCategory
    if (selectedPricing) filters.pricing_type = selectedPricing

    fetchProducts(filters)
      .then((data) => {
        if (!cancelled) {
          let sorted = data.products || []
          if (sortBy === 'name') sorted = [...sorted].sort((a, b) => a.name.localeCompare(b.name))
          if (sortBy === 'price_asc') sorted = [...sorted].sort((a, b) => a.price_per_day - b.price_per_day)
          if (sortBy === 'price_desc') sorted = [...sorted].sort((a, b) => b.price_per_day - a.price_per_day)
          setProducts(sorted)
          setTotal(data.total || sorted.length)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) { console.error(err); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [search, selectedCategory, selectedPricing, sortBy])

  const handleCategoryClick = (slug) => {
    const newSlug = selectedCategory === slug ? '' : slug
    setSelectedCategory(newSlug)
    updateParams('category', newSlug)
  }

  const handlePricingClick = (type) => {
    const newType = selectedPricing === type ? '' : type
    setSelectedPricing(newType)
    updateParams('pricing', newType)
  }

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params, { replace: true })
  }

  return (
    <div style={{ backgroundColor: '#0D0D0D' }}>
      {/* Header */}
      <section className="py-12" style={{ backgroundColor: '#0A0A0A', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
            {t('catalog.tag')}
          </p>
          <h1 className="text-3xl mb-2 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
            {t('catalog.title')}
          </h1>
          <p className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            {t('catalog.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="#666" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('catalog.search_placeholder')}
              className="w-full pl-10 pr-4 py-3 text-sm"
              style={{ backgroundColor: '#141414', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
              onFocus={(e) => (e.target.style.borderColor = '#D23AB0')}
              onBlur={(e) => (e.target.style.borderColor = '#222')} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-medium" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
              {t('catalog.sort_by')}
            </span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 text-sm cursor-pointer"
              style={{ backgroundColor: '#141414', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
              <option value="newest">{t('catalog.sort_newest')}</option>
              <option value="price_asc">{t('catalog.sort_price_asc')}</option>
              <option value="price_desc">{t('catalog.sort_price_desc')}</option>
              <option value="name">{t('catalog.sort_name')}</option>
            </select>
          </div>
        </div>

        {/* Pricing type filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          <button onClick={() => handlePricingClick('')}
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: !selectedPricing ? '#D23AB0' : 'transparent',
              color: !selectedPricing ? '#FFFFFF' : '#666',
              border: `1px solid ${!selectedPricing ? '#D23AB0' : '#222'}`,
              fontFamily: 'Outfit, sans-serif',
            }}>
            Tous les prix
          </button>
          {Object.entries(pricingLabels).map(([key, label]) => (
            <button key={key} onClick={() => handlePricingClick(key)}
              className="px-4 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedPricing === key ? '#D23AB0' : 'transparent',
                color: selectedPricing === key ? '#FFFFFF' : '#666',
                border: `1px solid ${selectedPricing === key ? '#D23AB0' : '#222'}`,
                fontFamily: 'Outfit, sans-serif',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          <button onClick={() => handleCategoryClick('')}
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: !selectedCategory ? '#7B61FF' : 'transparent',
              color: !selectedCategory ? '#FFFFFF' : '#666',
              border: `1px solid ${!selectedCategory ? '#7B61FF' : '#222'}`,
              fontFamily: 'Outfit, sans-serif',
            }}>
            {t('catalog.all_categories')}
          </button>
          {Object.entries(categoryLabels).map(([slug, label]) => (
            <button key={slug} onClick={() => handleCategoryClick(slug)}
              className="px-4 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === slug ? '#7B61FF' : 'transparent',
                color: selectedCategory === slug ? '#FFFFFF' : '#666',
                border: `1px solid ${selectedCategory === slug ? '#7B61FF' : '#222'}`,
                fontFamily: 'Outfit, sans-serif',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            {loading ? '...' : `${total} ${t('catalog.results')}`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#222" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-lg mb-2 font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
              {t('catalog.no_results')}
            </p>
            <p className="text-sm" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
              {t('catalog.no_results_desc')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
