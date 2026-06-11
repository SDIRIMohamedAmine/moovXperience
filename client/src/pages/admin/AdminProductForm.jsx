import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { fetchProduct } from '../../services/productService'
import { fetchAllCategories, isAdminLoggedIn } from '../../services/adminService'
import { showToast } from '../../components/Toast'
import MediaUploader from '../../components/MediaUploader'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    price_per_day: '',
    price_purchase: '',
    deposit: '',
    stock: '1',
    is_available: true,
    mode: 'both',
    pricing_type: 'fixed',
    min_duration: '1',
  })
  const [mediaFiles, setMediaFiles] = useState([])

  useEffect(() => {
    fetchAllCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    if (isEdit && isAdminLoggedIn()) {
      setLoading(true)
      fetchProduct(id)
        .then((product) => {
          setForm({
            name: product.name || '',
            description: product.description || '',
            category_id: product.category_id || '',
            price_per_day: String(product.price_per_day || ''),
            price_purchase: product.price_purchase != null ? String(product.price_purchase) : '',
            deposit: String(product.deposit || ''),
            stock: String(product.stock || '1'),
            is_available: product.is_available ?? true,
            mode: product.mode || 'both',
            pricing_type: product.pricing_type || 'fixed',
            min_duration: String(product.min_duration || '1'),
          })
          // Convert existing images to mediaFiles format
          if (product.images && product.images.length > 0) {
            setMediaFiles(product.images.map(url => ({
              url,
              type: url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image',
              name: url.split('/').pop(),
            })))
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const data = {
      name: form.name,
      description: form.description || null,
      category_id: form.category_id || null,
      price_per_day: form.price_per_day,
      price_purchase: form.price_purchase || null,
      deposit: form.deposit || '0',
      stock: form.stock || '1',
      images: mediaFiles.map(f => f.url),
      is_available: form.is_available,
      mode: form.mode,
      pricing_type: form.pricing_type,
      min_duration: form.min_duration || '1',
      options: [],
    }

    try {
      const token = localStorage.getItem('admin-token')
      const url = isEdit ? `${API_URL}/products/${id}` : `${API_URL}/products`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save product')
      }

      showToast(isEdit ? 'Solution mise à jour' : 'Solution créée', 'success')
      navigate('/admin/products')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: '#D23AB0' }} />
      </div>
    )
  }

  const inputStyle = { backgroundColor: '#0D0D0D', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }
  const labelStyle = { color: '#666', fontFamily: 'Outfit, sans-serif' }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: '#D23AB0', fontFamily: 'Outfit, sans-serif' }}>
          Administration
        </p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {isEdit ? 'Modifier la solution' : 'Nouvelle solution'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#141414', border: '1px solid #222' }} className="p-8 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Nom *</label>
          <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required
            className="w-full px-4 py-3 text-sm" style={inputStyle} />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4}
            className="w-full px-4 py-3 text-sm resize-y" style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Catégorie</label>
            <select value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)}
              className="w-full px-4 py-3 text-sm" style={{ ...inputStyle, backgroundColor: '#0D0D0D' }}>
              <option value="">Sélectionner</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Mode</label>
            <select value={form.mode} onChange={(e) => handleChange('mode', e.target.value)}
              className="w-full px-4 py-3 text-sm" style={{ ...inputStyle, backgroundColor: '#0D0D0D' }}>
              <option value="both">Location & Achat</option>
              <option value="rental">Location uniquement</option>
              <option value="sale">Achat uniquement</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Type de prix</label>
          <select value={form.pricing_type} onChange={(e) => handleChange('pricing_type', e.target.value)}
            className="w-full px-4 py-3 text-sm" style={{ ...inputStyle, backgroundColor: '#0D0D0D' }}>
            <option value="fixed">Prix fixe</option>
            <option value="negotiable">Prix négociable</option>
            <option value="suggestion">Suggestion de prix</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Prix/jour (TND) *</label>
            <input type="number" value={form.price_per_day} onChange={(e) => handleChange('price_per_day', e.target.value)} required min="0" step="0.01"
              className="w-full px-4 py-3 text-sm" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Prix achat (TND)</label>
            <input type="number" value={form.price_purchase} onChange={(e) => handleChange('price_purchase', e.target.value)} min="0" step="0.01"
              className="w-full px-4 py-3 text-sm" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Stock</label>
            <input type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} min="0"
              className="w-full px-4 py-3 text-sm" style={inputStyle} />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={labelStyle}>Médias (images & vidéos)</label>
          <MediaUploader files={mediaFiles} onChange={setMediaFiles} maxFiles={10} />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_available" checked={form.is_available} onChange={(e) => handleChange('is_available', e.target.checked)}
            className="w-4 h-4 accent-[#D23AB0]" />
          <label htmlFor="is_available" className="text-sm" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
            Disponible
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="px-8 py-3 text-xs uppercase tracking-widest font-bold"
            style={{
              background: 'linear-gradient(135deg, #D23AB0, #AE59CE)',
              color: '#FFFFFF',
              fontFamily: 'Outfit, sans-serif',
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer')}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')}
            className="px-6 py-3 text-xs uppercase tracking-widest font-medium"
            style={{ border: '1px solid #222', color: '#666', fontFamily: 'Outfit, sans-serif' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
