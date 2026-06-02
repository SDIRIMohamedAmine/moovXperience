import { useState, useEffect } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
import { fetchProducts } from '../services/productService'
import { fetchCategories } from '../services/categoryService'
import ProductCard from '../components/ProductCard'

export default function CatalogPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    let cancelled = false
    const filters = {}
    if (search) filters.search = search
    if (selectedCategory) filters.category = selectedCategory

    fetchProducts(filters)
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products)
          setTotal(data.total)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [search, selectedCategory])

  return (
    <div>
      {/* Header */}
      <section className="py-12" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E3E6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('catalog.tag')}
          </p>
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}>
            {t('catalog.title')}
          </h1>
          <p className="text-sm" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {t('catalog.subtitle')}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E3E6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('catalog.search_placeholder')}
              className="flex-1 px-4 py-2.5 text-sm outline-none"
              style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
              onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
              onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 text-sm outline-none"
              style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841', backgroundColor: '#FFFFFF' }}
            >
              <option value="">{t('catalog.all_categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#E0E3E6', borderTopColor: '#76ABAE' }} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}>
                {t('catalog.no_results')}
              </h3>
              <p className="text-sm" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                {t('catalog.no_results_desc')}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm mb-6" style={{ color: '#8A939B', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                {total} {total === 1 ? 'produit' : 'produits'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
