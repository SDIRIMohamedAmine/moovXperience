const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getAdminToken() {
  return localStorage.getItem('admin-token')
}

function authHeaders() {
  const token = getAdminToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export function isAdminLoggedIn() {
  return !!getAdminToken()
}

export function adminLogout() {
  localStorage.removeItem('admin-token')
  localStorage.removeItem('admin-user')
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API_URL}/admin-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  localStorage.setItem('admin-token', data.token)
  localStorage.setItem('admin-user', JSON.stringify(data.user))
  return data
}

export async function fetchStats() {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function fetchUsers(params = {}) {
  const qs = new URLSearchParams()
  if (params.role) qs.set('role', params.role)
  if (params.limit) qs.set('limit', params.limit)
  const res = await fetch(`${API_URL}/admin/users?${qs}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function updateUserRole(id, role) {
  const res = await fetch(`${API_URL}/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update role')
  }
  return res.json()
}

export async function fetchAllProducts(params = {}) {
  const qs = new URLSearchParams()
  if (params.limit) qs.set('limit', params.limit)
  const res = await fetch(`${API_URL}/admin/products?${qs}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function toggleProductAvailability(id) {
  const res = await fetch(`${API_URL}/admin/products/${id}/toggle`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to toggle product')
  return res.json()
}

export async function deleteProductAdmin(id) {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete product')
  return res.json()
}

export async function fetchAllRentals(params = {}) {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.limit) qs.set('limit', params.limit)
  const res = await fetch(`${API_URL}/admin/rentals?${qs}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch rentals')
  return res.json()
}

export async function fetchRentalDetails(id) {
  const res = await fetch(`${API_URL}/admin/rentals/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch rental details')
  return res.json()
}

export async function updateRentalStatus(id, status) {
  const res = await fetch(`${API_URL}/rentals/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update status')
  }
  return res.json()
}

export async function deleteRental(id) {
  const res = await fetch(`${API_URL}/admin/rentals/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete rental')
  return res.json()
}

export async function fetchAllCategories() {
  const res = await fetch(`${API_URL}/admin/categories`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createCategory(name, slug) {
  const res = await fetch(`${API_URL}/admin/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, slug }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create category')
  }
  return res.json()
}

export async function updateCategory(id, data) {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update category')
  }
  return res.json()
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete category')
  }
  return res.json()
}
