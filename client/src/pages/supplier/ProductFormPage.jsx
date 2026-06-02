import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n/LanguageContext'
import { useAuth } from '../../hooks/useAuth'
import { fetchProduct, createProduct, updateProduct } from '../../services/productService'
import { fetchCategories } from '../../services/categoryService'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { session } = useAuth()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    price_per_day: '',
    deposit: '',
    stock: '1',
    location: '',
    images: '',
    is_available: true,
  })

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    if (isEdit && session?.access_token) {
      let cancelled = false
      fetchProduct(id)
        .then((product) => {
          if (!cancelled) {
            setForm({
              name: product.name || '',
              description: product.description || '',
              category_id: product.category_id || '',
              price_per_day: String(product.price_per_day || ''),
              deposit: String(product.deposit || ''),
              stock: String(product.stock || '1'),
              location: product.location || '',
              images: product.images?.join('\n') || '',
              is_available: product.is_available ?? true,
            })
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError('Produit non trouvé')
            setLoading(false)
          }
        })

      return () => { cancelled = true }
    }
  }, [id, isEdit, session])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const data = {
      name: form.name,
      description: form.description || null,
      category_id: form.category_id || null,
      price_per_day: form.price_per_day,
      deposit: form.deposit || '0',
      stock: form.stock || '1',
      location: form.location || null,
      images: form.images ? form.images.split('\n').filter(Boolean) : [],
      is_available: form.is_available,
    }

    try {
      if (isEdit) {
        await updateProduct(id, data, session.access_token)
        navigate('/supplier/products')
      } else {
        await createProduct(data, session.access_token)
        navigate('/supplier/products')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#E0E3E6', borderTopColor: '#76ABAE' }} />
      </div>
    )
  }

  const tf = (key) => t(`supplier_products.form.${key}`)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: '#76ABAE', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
          {isEdit ? t('supplier_products.edit_product') : t('supplier_products.add_product')}
        </p>
        <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#303841', fontWeight: 600 }}>
          {isEdit ? t('supplier_products.edit_product') : t('supplier_products.add_product')}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm" style={{ backgroundColor: '#FFF3E0', color: '#E64A19', border: '1px solid #FFCCBC' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E3E6' }} className="p-8 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {tf('name')} *
          </label>
          <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required
            className="w-full px-4 py-3 text-sm outline-none"
            style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
            onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
            onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {tf('description')}
          </label>
          <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4}
            className="w-full px-4 py-3 text-sm outline-none resize-y"
            style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
            onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
            onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {tf('category')}
          </label>
          <select value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none"
            style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841', backgroundColor: '#FFFFFF' }}
          >
            <option value="">{tf('select_category')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {tf('price_per_day')} *
            </label>
            <input type="number" value={form.price_per_day} onChange={(e) => handleChange('price_per_day', e.target.value)} required min="0" step="0.01"
              className="w-full px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
              onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
              onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {tf('deposit')}
            </label>
            <input type="number" value={form.deposit} onChange={(e) => handleChange('deposit', e.target.value)} min="0" step="0.01"
              className="w-full px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
              onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
              onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {tf('stock')}
            </label>
            <input type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} min="0"
              className="w-full px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
              onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
              onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {tf('location')}
            </label>
            <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
              onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
              onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {tf('images')}
          </label>
          <textarea value={form.images} onChange={(e) => handleChange('images', e.target.value)} rows={2}
            placeholder={tf('image_url_placeholder')}
            className="w-full px-4 py-3 text-sm outline-none resize-y"
            style={{ border: '1px solid #E0E3E6', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#303841' }}
            onFocus={(e) => (e.target.style.borderColor = '#76ABAE')}
            onBlur={(e) => (e.target.style.borderColor = '#E0E3E6')}
          />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_available" checked={form.is_available} onChange={(e) => handleChange('is_available', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="is_available" className="text-sm" style={{ color: '#303841', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
            {tf('is_available')}
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="px-8 py-3 text-sm uppercase tracking-widest font-medium"
            style={{ backgroundColor: '#FF5722', color: '#FFFFFF', fontFamily: 'DM Sans, system-ui, sans-serif' }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#E64A19')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#FF5722')}
          >
            {saving ? (isEdit ? tf('updating') : tf('creating')) : (isEdit ? tf('update') : tf('create'))}
          </button>
          <button type="button" onClick={() => navigate('/supplier/products')}
            className="px-6 py-3 text-sm uppercase tracking-widest font-medium"
            style={{ border: '1px solid #E0E3E6', color: '#5A6570', fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            {t('profile.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
