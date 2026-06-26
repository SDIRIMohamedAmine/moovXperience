import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { fetchProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/Skeleton'

const getCategoryLabels = (t) => ({
  'gamification-interactive': t('catalog.cat_gamification'),
  'marketing-activation': t('catalog.cat_marketing'),
  'materiel-evenementiel': t('catalog.cat_equipment'),
  'photo-video': t('catalog.cat_photo'),
  'son-eclairage': t('catalog.cat_sound'),
  'decoration-mobilier': t('catalog.cat_decoration'),
  'animation-spectacle': t('catalog.cat_entertainment'),
  'traiteur-restauration': t('catalog.cat_catering'),
})

const getPricingLabels = (t) => ({
  fixed: t('catalog.pricing_fixed'),
  negotiable: t('catalog.pricing_negotiable'),
  suggestion: t('catalog.pricing_suggestion'),
})

export default function RentalsPage() {
  const { t } = useTranslation()
  const categoryLabels = getCategoryLabels(t)
  const pricingLabels = getPricingLabels(t)
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedPricing, setSelectedPricing] = useState(searchParams.get('pricing') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [total, setTotal] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const filters = { mode: 'rental' }
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

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params, { replace: true })
  }

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

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedPricing('')
    setSearch('')
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters = selectedCategory || selectedPricing || search

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          {t('catalog.search_placeholder').replace('...', '')}
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('catalog.search_placeholder')}
            className="w-full pl-9 pr-3 py-2.5 text-sm"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          {t('catalog.categories')}
        </label>
        <div className="space-y-1">
          <button onClick={() => handleCategoryClick('')}
            className="w-full text-left px-3 py-2 text-sm transition-all rounded"
            style={{
              backgroundColor: !selectedCategory ? 'var(--accent-bg)' : 'transparent',
              color: !selectedCategory ? 'var(--accent)' : 'var(--text-muted)',
              
            }}>
            {t('catalog.all_categories')}
          </button>
          {Object.entries(categoryLabels).map(([slug, label]) => (
            <button key={slug} onClick={() => handleCategoryClick(slug)}
              className="w-full text-left px-3 py-2 text-sm transition-all rounded"
              style={{
                backgroundColor: selectedCategory === slug ? 'var(--accent-bg)' : 'transparent',
                color: selectedCategory === slug ? 'var(--accent)' : 'var(--text-muted)',
                
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          {t('catalog.pricing_type')}
        </label>
        <div className="space-y-1">
          <button onClick={() => handlePricingClick('')}
            className="w-full text-left px-3 py-2 text-sm transition-all rounded"
            style={{
              backgroundColor: !selectedPricing ? 'var(--accent-bg)' : 'transparent',
              color: !selectedPricing ? 'var(--accent)' : 'var(--text-muted)',
              
            }}>
            {t('catalog.pricing_all')}
          </button>
          {Object.entries(pricingLabels).map(([key, label]) => (
            <button key={key} onClick={() => handlePricingClick(key)}
              className="w-full text-left px-3 py-2 text-sm transition-all rounded"
              style={{
                backgroundColor: selectedPricing === key ? 'var(--accent-bg)' : 'transparent',
                color: selectedPricing === key ? 'var(--accent)' : 'var(--text-muted)',
                
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters}
          className="w-full py-2.5 text-xs uppercase tracking-wider font-medium transition-all"
          style={{ border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer' }}>
          {t('catalog.clear_filters')}
        </button>
      )}
    </div>
  )

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      <section className="py-12" style={{ backgroundColor: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)' }}>
            {t('rentals_page.tag')}
          </p>
          <h1 className="text-3xl mb-2 font-bold" style={{  color: 'var(--text-primary)' }}>
            {t('rentals_page.title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('rentals_page.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:hidden mb-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <span>{t('catalog.filters')} {hasActiveFilters ? t('catalog.filters_active') : ''}</span>
            <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <div className="flex gap-8">
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="sticky top-24 p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {loading ? '...' : `${total} ${t('catalog.results')}`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-medium hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                  {t('catalog.sort_by')}
                </span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="newest">{t('catalog.sort_newest')}</option>
                  <option value="price_asc">{t('catalog.sort_price_asc')}</option>
                  <option value="price_desc">{t('catalog.sort_price_desc')}</option>
                  <option value="name">{t('catalog.sort_name')}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="var(--border)" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-lg mb-2 font-bold" style={{  color: 'var(--text-primary)' }}>
                  {t('catalog.no_results')}
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {t('catalog.no_results_desc')}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="px-6 py-2 text-sm font-medium"
                    style={{ border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer' }}>
                    {t('catalog.clear_filters')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
