import { supabase } from '../lib/supabase.js'
import { verifyAdminToken } from '../routes/adminAuth.js'
import { cacheGet, cacheSet, cacheDel } from '../lib/cache.js'

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

  const cached = await cacheGet('admin:stats')
  if (cached) return res.json(cached)

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

  const stats = {
    users: users.count || 0,
    suppliers: suppliers || 0,
    clients: clients || 0,
    products: products.count || 0,
    rentals: rentals.count || 0,
    quotes: quotes.count || 0,
    pendingRentals: pendingRentals || 0,
    pendingQuotes: pendingQuotes || 0,
  }
  cacheSet('admin:stats', stats, 30)
  res.json(stats)
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

  cacheDel('admin:stats')
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

  cacheDel('products:*')
  cacheDel(`product:${id}`)
  cacheDel('admin:stats')
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

  cacheDel('products:*')
  cacheDel(`product:${id}`)
  cacheDel('admin:stats')
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

  cacheDel('admin:stats')
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

  cacheDel('categories:*')
  cacheDel('admin:stats')
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

  cacheDel('categories:*')
  cacheDel('products:*')
  cacheDel('admin:stats')
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

  cacheDel('categories:*')
  cacheDel('admin:stats')
  res.json({ success: true })
}

// --- Global Settings ---

export async function getSettings(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { data, error } = await supabase
    .from('global_settings')
    .select('key, value')

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch settings' })
  }

  const settings = {}
  for (const row of data) settings[row.key] = row.value
  res.json(settings)
}

export async function updateSetting(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { key, value } = req.body
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'key and value required' })
  }

  const { error } = await supabase
    .from('global_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(500).json({ error: 'Failed to update setting' })
  }

  cacheDel('settings')
  res.json({ success: true })
}

// --- Site Pages (CMS) ---

export async function upsertPage(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { slug } = req.params
  const { lang, title, subtitle, tag, sections } = req.body

  const { error } = await supabase
    .from('site_pages')
    .upsert({
      slug,
      lang: lang || 'fr',
      title,
      subtitle,
      tag,
      sections: sections || [],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug,lang' })

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(500).json({ error: 'Failed to save page' })
  }

  cacheDel(`page:${slug}`)
  res.json({ success: true })
}

// --- Blog Posts ---

export async function createBlogPost(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { slug, lang, title, excerpt, body, cover_image, status } = req.body
  if (!slug || !title) {
    return res.status(400).json({ error: 'slug and title required' })
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      lang: lang || 'fr',
      title,
      excerpt,
      body,
      cover_image,
      status: status || 'draft',
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(500).json({ error: 'Failed to create post' })
  }

  cacheDel('blog:*')
  res.json(data)
}

export async function updateBlogPost(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params
  const { slug, lang, title, excerpt, body, cover_image, status } = req.body

  const updates = { updated_at: new Date().toISOString() }
  if (slug !== undefined) updates.slug = slug
  if (lang !== undefined) updates.lang = lang
  if (title !== undefined) updates.title = title
  if (excerpt !== undefined) updates.excerpt = excerpt
  if (body !== undefined) updates.body = body
  if (cover_image !== undefined) updates.cover_image = cover_image
  if (status !== undefined) {
    updates.status = status
    if (status === 'published') updates.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(500).json({ error: 'Failed to update post' })
  }

  cacheDel('blog:*')
  res.json(data)
}

export async function deleteBlogPost(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.params
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(500).json({ error: 'Failed to delete post' })
  }

  cacheDel('blog:*')
  res.json({ success: true })
}

export async function getAllBlogPosts(req, res) {
  if (!(await requireAdmin(req, res))) return

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin operation error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch posts' })
  }

  res.json(data)
}

