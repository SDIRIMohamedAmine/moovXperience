import { supabase } from '../lib/supabase.js'
import { verifyAdminToken } from '../routes/adminAuth.js'

// Verify admin role - accepts both Supabase tokens and admin .env tokens
async function requireAdmin(req, res) {
  // Check if this is an admin token from .env login
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const adminPayload = verifyAdminToken(token)
    if (adminPayload) {
      // Valid admin token from .env
      return true
    }
  }

  // Otherwise check Supabase user role
  if (!req.user?.id) {
    res.status(403).json({ error: 'Admin access required' })
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return false
  }
  return true
}

export async function getStats(req, res) {
  if (!(await requireAdmin(req, res))) return

  const [users, products, rentals, quotes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('rentals').select('id', { count: 'exact', head: true }),
    supabase.from('quotes').select('id', { count: 'exact', head: true }),
  ])

  const { count: suppliers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'supplier')

  const { count: clients } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'client')

  const { count: pendingRentals } = await supabase
    .from('rentals')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingQuotes } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  res.json({
    users: users.count || 0,
    suppliers: suppliers || 0,
    clients: clients || 0,
    products: products.count || 0,
    rentals: rentals.count || 0,
    quotes: quotes.count || 0,
    pendingRentals: pendingRentals || 0,
    pendingQuotes: pendingQuotes || 0,
  })
}

export async function getUsers(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { role, limit = 50, offset = 0 } = req.query
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
  const safeOffset = Math.max(Number(offset) || 0, 0)

  let query = supabase
    .from('profiles')
    .select('id, role, full_name, phone, avatar_url, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (role && ['client', 'admin'].includes(role)) {
    query = query.eq('role', role)
  }

  const { data, error, count } = await query

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch users' })
  }

  res.json({ users: data, total: count })
}

export async function updateUserRole(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params
  const { role } = req.body

  if (!['client', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json({ success: true })
}

export async function getAllProducts(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { limit = 50, offset = 0 } = req.query
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
  const safeOffset = Math.max(Number(offset) || 0, 0)

  const { data, error, count } = await supabase
    .from('products')
    .select('id, name, price_per_day, price_purchase, stock, is_available, mode, pricing_type, created_at, categories(name)', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch products' })
  }

  res.json({ products: data, total: count })
}

export async function toggleProductAvailability(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('is_available')
    .eq('id', id)
    .single()

  if (fetchError || !product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const { error } = await supabase
    .from('products')
    .update({ is_available: !product.is_available, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json({ success: true, is_available: !product.is_available })
}

export async function deleteProductAdmin(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json({ success: true })
}

export async function getAllRentals(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { status, client_id, limit = 50, offset = 0 } = req.query
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
  const safeOffset = Math.max(Number(offset) || 0, 0)

  let query = supabase
    .from('rentals')
    .select('id, status, start_date, end_date, total_price, payment_status, client_id, created_at, profiles!client_id(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (status && ['pending', 'confirmed', 'delivered', 'returned', 'completed', 'cancelled'].includes(status)) {
    query = query.eq('status', status)
  }

  if (client_id) {
    query = query.eq('client_id', client_id)
  }

  const { data, error, count } = await query

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch rentals' })
  }

  res.json({ rentals: data, total: count })
}

export async function getRentalDetails(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params

  const { data, error } = await supabase
    .from('rentals')
    .select('*, profiles!client_id(full_name, phone), rental_items(*, products(name, images))')
    .eq('id', id)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Rental not found' })
  }

  res.json(data)
}

export async function deleteRental(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params

  // Delete rental items first
  await supabase.from('rental_items').delete().eq('rental_id', id)

  const { error } = await supabase.from('rentals').delete().eq('id', id)

  if (error) {
    console.error('Delete rental error:', error.message)
    return res.status(400).json({ error: 'Failed to delete rental' })
  }

  res.json({ success: true })
}

export async function getAllCategories(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' })
  }

  res.json(data)
}

export async function createCategory(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { name, slug } = req.body

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format' })
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim().slice(0, 100), slug: slug.trim().slice(0, 100) })
    .select()
    .single()

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.status(201).json(data)
}

export async function updateCategory(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params
  const { name, slug } = req.body

  const updates = {}
  if (name) updates.name = name.trim().slice(0, 100)
  if (slug) {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' })
    }
    updates.slug = slug.trim().slice(0, 100)
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json(data)
}

export async function deleteCategory(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params

  // Check if category has products
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
    .is('deleted_at', null)

  if (count > 0) {
    return res.status(400).json({ error: `Cannot delete: ${count} products use this category` })
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json({ success: true })
}
