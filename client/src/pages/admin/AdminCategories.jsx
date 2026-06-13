import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchAllCategories, createCategory, updateCategory, deleteCategory, isAdminLoggedIn } from '../../services/adminService'
import { showToast } from '../../components/Toast'
import { showConfirm } from '../../components/ConfirmModal'
import { useTranslation } from '../../i18n/LanguageContext'

export default function AdminCategories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (isAdminLoggedIn()) {
      fetchAllCategories()
        .then(setCategories)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [])

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName || !newSlug) return
    try {
      const cat = await createCategory(newName, newSlug)
      setCategories(prev => [...prev, cat])
      setNewName('')
      setNewSlug('')
      showToast(t('admin.category_created'), 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleUpdate = async (id) => {
    if (!editName) return
    try {
      const cat = await updateCategory(id, { name: editName })
      setCategories(prev => prev.map(c => c.id === id ? cat : c))
      setEditing(null)
      showToast(t('admin.category_updated'), 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (id, name) => {
    showConfirm(`${t('admin.category_delete_confirm')} "${name}" ?`, async () => {
      try {
        await deleteCategory(id)
        setCategories(prev => prev.filter(c => c.id !== id))
        showToast(t('admin.category_deleted'), 'success')
      } catch (err) {
        showToast(err.message, 'error')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2 font-medium" style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
          {t('admin.login_title')}
        </p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>
          {t('admin.categories')}
        </h1>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder={t('admin.category_name')} className="flex-1 px-4 py-3 text-sm"
          style={{ backgroundColor: '#141414', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }} />
        <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          placeholder="slug" className="w-40 px-4 py-3 text-sm"
          style={{ backgroundColor: '#141414', border: '1px solid #222', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }} />
        <button type="submit"
          className="px-6 py-3 text-xs uppercase tracking-widest font-semibold"
          style={{ background: 'linear-gradient(135deg, var(--accent), #AE59CE)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
          {t('admin.add_category')}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 p-4 transition-all"
              style={{ backgroundColor: '#141414', border: '1px solid #1a1a1a' }}>
              {editing === cat.id ? (
                <>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm"
                    style={{ backgroundColor: '#0D0D0D', border: '1px solid var(--accent)', color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}
                    autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)} />
                  <button onClick={() => handleUpdate(cat.id)}
                    className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium"
                    style={{ border: '1px solid #4CAF50', color: '#4CAF50', fontFamily: 'Outfit, sans-serif' }}>
                    {t('admin.save')}
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium"
                    style={{ border: '1px solid #666', color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                    {t('common.cancel')}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                      {cat.name}
                    </p>
                    <p className="text-xs" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                      {cat.slug}
                    </p>
                  </div>
                  <button onClick={() => { setEditing(cat.id); setEditName(cat.name) }}
                    className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium"
                    style={{ border: '1px solid #222', color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                    {t('admin.rename_category')}
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-xs px-3 py-1.5 uppercase tracking-wider font-medium"
                    style={{ border: '1px solid #FF6B6B', color: '#FF6B6B', fontFamily: 'Outfit, sans-serif' }}>
                    {t('admin.delete')}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
