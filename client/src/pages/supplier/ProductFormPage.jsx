import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { fetchProduct, createProduct, updateProduct } from '../../services/productService'
import { fetchCategories } from '../../services/categoryService'
import { supabase, getFreshToken } from '../../lib/supabase'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { session } = useAuth()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    price_per_day: '',
    price_purchase: '',
    deposit: '',
    stock: '1',
    location: '',
    images: '',
    is_available: true,
    mode: 'rental',
    pricing_type: 'fixed',
    video_url: '',
    min_duration: '1',
  })
  const [uploadedImages, setUploadedImages] = useState([])
  const [options, setOptions] = useState([])

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
              price_purchase: product.price_purchase != null ? String(product.price_purchase) : '',
              deposit: String(product.deposit || ''),
              stock: String(product.stock || '1'),
              location: product.location || '',
              images: '',
              is_available: product.is_available ?? true,
              mode: product.mode || 'rental',
              pricing_type: product.pricing_type || 'fixed',
              video_url: product.video_url || '',
              min_duration: String(product.min_duration || '1'),
            })
            setUploadedImages(product.images || [])
            setOptions(product.options || [])
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError('Solution non trouvée')
            setLoading(false)
          }
        })

      return () => { cancelled = true }
    }
  }, [id, isEdit, session])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    const newUrls = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) {
        setError(`Fichier trop volumineux: ${file.name} (max 5 Mo)`)
        continue
      }

      const ext = file.name.split('.').pop()
      const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600' })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      newUrls.push(urlData.publicUrl)
    }

    setUploadedImages(prev => [...prev, ...newUrls])
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = async (index) => {
    const url = uploadedImages[index]
    if (url.includes('product-images/')) {
      const path = url.split('product-images/')[1]
      if (path) {
        await supabase.storage.from('product-images').remove([path])
      }
    }
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const addOption = () => {
    setOptions(prev => [...prev, { name: '', price: 0, description: '' }])
  }

  const updateOption = (index, field, value) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, [field]: value } : opt))
  }

  const removeOption = (index) => {
    setOptions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const urlImages = form.images ? form.images.split('\n').filter(Boolean) : []
    const allImages = [...uploadedImages, ...urlImages]

    const data = {
      name: form.name,
      description: form.description || null,
      category_id: form.category_id || null,
      price_per_day: form.price_per_day,
      price_purchase: form.price_purchase || null,
      deposit: form.deposit || '0',
      stock: form.stock || '1',
      location: form.location || null,
      images: allImages,
      is_available: form.is_available,
      mode: form.mode,
      pricing_type: form.pricing_type,
      video_url: form.video_url || null,
      min_duration: form.min_duration || '1',
      options: options.filter(opt => opt.name && opt.price >= 0),
    }

    try {
      if (isEdit) {
        await updateProduct(id, data, await getFreshToken())
      } else {
        await createProduct(data, await getFreshToken())
      }
      navigate('/supplier/products')
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

  const inputStyle = { border: `1px solid ${colors.border}`, color: colors.primary }
  const labelStyle = { color: colors.textSecondary }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.accent }}>
          {isEdit ? t('supplier_products.edit_product') : t('supplier_products.add_product')}
        </p>
        <h1 className="text-3xl" style={{  color: colors.primary, fontWeight: 600 }}>
          {isEdit ? t('supplier_products.edit_product') : t('supplier_products.add_product')}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm" role="alert" style={{ backgroundColor: '#FFF3E0', color: '#E64A19', border: '1px solid #FFCCBC' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}` }} className="p-8 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
            {tf('name')} *
          </label>
          <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required
            className="w-full px-4 py-3 text-sm"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = colors.accent)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
            {tf('description')}
          </label>
          <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4}
            className="w-full px-4 py-3 text-sm resize-y"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = colors.accent)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>

        {/* Category + Mode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
              {tf('category')}
            </label>
            <select value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)}
              className="w-full px-4 py-3 text-sm"
              style={{ ...inputStyle, backgroundColor: colors.bgWhite }}
            >
              <option value="">{tf('select_category')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
              {tf('mode')}
            </label>
            <select value={form.mode} onChange={(e) => handleChange('mode', e.target.value)}
              className="w-full px-4 py-3 text-sm"
              style={{ ...inputStyle, backgroundColor: colors.bgWhite }}
            >
              <option value="rental">{tf('mode_rental')}</option>
              <option value="sale">{tf('mode_sale')}</option>
              <option value="both">{tf('mode_both')}</option>
            </select>
          </div>
        </div>

        {/* Pricing Type */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
            Type de prix
          </label>
          <select value={form.pricing_type} onChange={(e) => handleChange('pricing_type', e.target.value)}
            className="w-full px-4 py-3 text-sm"
            style={{ ...inputStyle, backgroundColor: colors.bgWhite }}
          >
            <option value="fixed">Prix fixe</option>
            <option value="negotiable">Prix négociable</option>
            <option value="suggestion">Suggestion de prix (le client propose)</option>
          </select>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
              {tf('price_per_day')} *
            </label>
            <input type="number" value={form.price_per_day} onChange={(e) => handleChange('price_per_day', e.target.value)} required min="0" step="0.01"
              className="w-full px-4 py-3 text-sm"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = colors.accent)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
              {tf('price_purchase')}
            </label>
            <input type="number" value={form.price_purchase} onChange={(e) => handleChange('price_purchase', e.target.value)} min="0" step="0.01"
              className="w-full px-4 py-3 text-sm"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = colors.accent)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>
        </div>

        {/* Deposit + Stock + Min Duration */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
              {tf('deposit')}
            </label>
            <input type="number" value={form.deposit} onChange={(e) => handleChange('deposit', e.target.value)} min="0" step="0.01"
              className="w-full px-4 py-3 text-sm"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = colors.accent)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
              {tf('stock')}
            </label>
            <input type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} min="0"
              className="w-full px-4 py-3 text-sm"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = colors.accent)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
              Durée min (jours)
            </label>
            <input type="number" value={form.min_duration} onChange={(e) => handleChange('min_duration', e.target.value)} min="1"
              className="w-full px-4 py-3 text-sm"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = colors.accent)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
            {tf('location')}
          </label>
          <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-4 py-3 text-sm"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = colors.accent)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
            {tf('video_url')}
          </label>
          <input type="url" value={form.video_url} onChange={(e) => handleChange('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-3 text-sm"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = colors.accent)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>
            {tf('images')}
          </label>

          {uploadedImages.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative w-20 h-20 border overflow-hidden group" style={{ borderColor: colors.border }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-opacity"
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.primary, opacity: uploading ? 0.6 : 1 }}>
            {uploading ? (
              <span className="w-4 h-4 border-2 animate-spin" style={{ borderColor: colors.border, borderTopColor: colors.accent }} />
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
            {uploading ? tf('uploading') : tf('upload_images')}
            <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>

          <textarea value={form.images} onChange={(e) => handleChange('images', e.target.value)} rows={2}
            placeholder={tf('image_url_placeholder')}
            className="w-full px-4 py-3 text-sm resize-y mt-2"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = colors.accent)}
            onBlur={(e) => (e.target.style.borderColor = colors.border)}
          />
        </div>

        {/* Options */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider" style={labelStyle}>
              {t('product.customization')}
            </label>
            <button type="button" onClick={addOption}
              className="text-xs px-3 py-1 transition-colors"
              style={{ color: colors.accent, border: `1px solid ${colors.accent}` }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = colors.accent; e.target.style.color = '#fff' }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = colors.accent }}
            >
              + Ajouter
            </button>
          </div>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 mb-2 items-start p-3" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <input type="text" value={opt.name} onChange={(e) => updateOption(i, 'name', e.target.value)}
                  placeholder="Nom de l'option"
                  className="px-3 py-2 text-sm"
                  style={inputStyle}
                />
                <input type="number" value={opt.price} onChange={(e) => updateOption(i, 'price', Number(e.target.value))}
                  placeholder="Prix (TND)"
                  min="0" step="0.01"
                  className="px-3 py-2 text-sm"
                  style={inputStyle}
                />
                <input type="text" value={opt.description || ''} onChange={(e) => updateOption(i, 'description', e.target.value)}
                  placeholder="Description"
                  className="px-3 py-2 text-sm"
                  style={inputStyle}
                />
              </div>
              <button type="button" onClick={() => removeOption(i)}
                className="w-8 h-8 flex items-center justify-center text-sm"
                style={{ color: '#E64A19' }}>
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Available checkbox */}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_available" checked={form.is_available} onChange={(e) => handleChange('is_available', e.target.checked)}
            className="w-4 h-4 accent-[#76ABAE]"
          />
          <label htmlFor="is_available" className="text-sm" style={{ color: colors.primary }}>
            {tf('is_available')}
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="px-8 py-3 text-sm uppercase tracking-widest font-medium"
            style={{ backgroundColor: colors.cta, color: colors.textWhite, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
            onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = colors.ctaHover)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = colors.cta)}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isEdit ? tf('updating') : tf('creating')}
              </span>
            ) : (isEdit ? tf('update') : tf('create'))}
          </button>
          <button type="button" onClick={() => navigate('/supplier/products')}
            className="px-6 py-3 text-sm uppercase tracking-widest font-medium"
            style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
          >
            {t('profile.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
