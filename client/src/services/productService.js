const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)
  if (filters.min_price) params.set('min_price', filters.min_price)
  if (filters.max_price) params.set('max_price', filters.max_price)
  if (filters.mode) params.set('mode', filters.mode)
  if (filters.pricing_type) params.set('pricing_type', filters.pricing_type)
  if (filters.provider) params.set('provider', filters.provider)
  if (filters.limit) params.set('limit', filters.limit)
  if (filters.offset) params.set('offset', filters.offset)

  const res = await fetch(`${API_URL}/products?${params}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`)
  if (!res.ok) throw new Error('Product not found')
  return res.json()
}

export async function fetchMyProducts(token) {
  const res = await fetch(`${API_URL}/products/supplier/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function createProduct(data, token) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create product')
  }
  return res.json()
}

export async function updateProduct(id, data, token) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update product')
  }
  return res.json()
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete product')
  return res.json()
}
