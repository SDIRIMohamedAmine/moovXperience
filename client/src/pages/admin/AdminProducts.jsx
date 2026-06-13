import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchAllProducts, toggleProductAvailability, deleteProductAdmin, isAdminLoggedIn } from '../../services/adminService'
import { showToast } from '../../components/Toast'
import { showConfirm } from '../../components/ConfirmModal'
import { useTranslation } from '../../i18n/LanguageContext'

export default function AdminProducts() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdminLoggedIn()) {
      fetchAllProducts()
        .then((data) => { setProducts(data.products); setTotal(data.total) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  const handleToggle = async (id) => {
    try {
      const result = await toggleProductAvailability(id)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: result.is_available } : p))
      showToast(result.is_available ? t('admin.product_activated') : t('admin.product_deactivated'), 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    showConfirm(t('admin.delete_confirm'), async () => {
      try {
        await deleteProductAdmin(id)
        setProducts(prev => prev.filter(p => p.id !== id))
        showToast(t('admin.product_deleted'), 'success')
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
          {t('admin.login_title')}
        </p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('admin.products')} <span className="text-lg font-normal" style={{ color: '#666' }}>({total})</span>
        </h1>
      </div>

      <Link to="/admin/products/new"
        className="inline-flex items-center gap-2 px-6 py-3 mb-6 text-xs uppercase tracking-widest font-semibold"
        style={{ background: 'linear-gradient(135deg, var(--accent), #AE59CE)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {t('admin.add_product')}
      </Link>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 transition-all"
              style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                  {product.name}
                </p>
                <p className="text-xs" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                  {product.categories?.name || '—'} · {product.profiles?.full_name || '—'} · {product.price_per_day} {t('admin.tnd_day')}
                  {product.price_purchase ? ` · ${product.price_purchase} ${t('admin.tnd_purchase')}` : ''}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 uppercase tracking-wider font-semibold"
                style={{
                  backgroundColor: product.mode === 'rental' ? 'var(--accent-bg)' : product.mode === 'sale' ? 'rgba(123,97,255,0.1)' : 'rgba(174,89,206,0.1)',
                  color: product.mode === 'rental' ? 'var(--accent)' : product.mode === 'sale' ? '#7B61FF' : '#AE59CE',
                  fontFamily: 'Outfit, sans-serif', fontSize: '10px',
                }}>
                {product.mode}
              </span>
              <button onClick={() => handleToggle(product.id)}
                className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium transition-colors"
                style={{
                  border: `1px solid ${product.is_available ? '#4CAF50' : '#FF9800'}`,
                  color: product.is_available ? '#4CAF50' : '#FF9800',
                  fontFamily: 'Outfit, sans-serif',
                }}>
                {product.is_available ? t('admin.toggle_active') : t('admin.toggle_inactive')}
              </button>
              <Link to={`/admin/products/${product.id}/edit`}
                className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium transition-colors"
                style={{ border: '1px solid var(--accent)', color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
                {t('admin.edit')}
              </Link>
              <button onClick={() => handleDelete(product.id)}
                className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium transition-colors"
                style={{ border: '1px solid #FF6B6B', color: '#FF6B6B', fontFamily: 'Outfit, sans-serif' }}>
                {t('admin.delete')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
