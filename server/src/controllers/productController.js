import { supabase } from '../lib/supabase.js'

function sanitizeSearch(input) {
  if (!input) return ''
  // Escape special LIKE characters and limit length
  return input.replace(/[%_]/g, '\\$&').slice(0, 100)
}

export async function getProducts(req, res) {
  const { category, search, min_price, max_price, limit = 20, offset = 0 } = req.query

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const safeOffset = Math.max(Number(offset) || 0, 0)

  let query = supabase
    .from('products')
    .select('id, name, description, price_per_day, deposit, stock, is_available, images, location, created_at, categories(name, slug), profiles!supplier_id(full_name)', { count: 'exact' })
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (category && /^[a-z0-9-]+$/.test(category)) {
    query = query.eq('categories.slug', category)
  }

  const sanitizedSearch = sanitizeSearch(search)
  if (sanitizedSearch) {
    query = query.or(`name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`)
  }

  if (min_price && !isNaN(Number(min_price))) {
    query = query.gte('price_per_day', Math.max(Number(min_price), 0))
  }

  if (max_price && !isNaN(Number(max_price))) {
    query = query.lte('price_per_day', Math.max(Number(max_price), 0))
  }

  const { data, error, count } = await query

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch products' })
  }

  res.json({ products: data, total: count })
}

export async function getProduct(req, res) {
  const { id } = req.params

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price_per_day, deposit, stock, is_available, images, location, created_at, categories(name, slug), profiles!supplier_id(full_name, phone, avatar_url)')
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Product not found' })
  }

  res.json(data)
}

export async function getMyProducts(req, res) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price_per_day, deposit, stock, is_available, images, location, created_at, categories(name, slug)')
    .eq('supplier_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch products' })
  }

  res.json(data)
}

export async function createProduct(req, res) {
  const { name, description, category_id, price_per_day, deposit, stock, location, images } = req.body

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Product name is required' })
  }

  if (name.length > 200) {
    return res.status(400).json({ error: 'Product name too long (max 200 chars)' })
  }

  const price = Number(price_per_day)
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Invalid price' })
  }

  const depositNum = Number(deposit || 0)
  if (isNaN(depositNum) || depositNum < 0) {
    return res.status(400).json({ error: 'Invalid deposit' })
  }

  const stockNum = Number(stock || 1)
  if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
    return res.status(400).json({ error: 'Invalid stock quantity' })
  }

  // Validate images is an array of strings
  let safeImages = []
  if (Array.isArray(images)) {
    safeImages = images.filter(img => typeof img === 'string' && img.length < 2000).slice(0, 10)
  }

  // Validate category_id is UUID if provided
  if (category_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)) {
    return res.status(400).json({ error: 'Invalid category ID' })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      supplier_id: req.user.id,
      name: name.trim().slice(0, 200),
      description: description ? String(description).slice(0, 5000) : null,
      category_id: category_id || null,
      price_per_day: price,
      deposit: depositNum,
      stock: stockNum,
      location: location ? String(location).slice(0, 500) : null,
      images: safeImages,
    })
    .select('*, categories(name, slug)')
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json(data)
}

export async function updateProduct(req, res) {
  const { id } = req.params

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('supplier_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Product not found' })
  }

  if (existing.supplier_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const { name, description, category_id, price_per_day, deposit, stock, is_available, location, images } = req.body

  const updates = {}
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid product name' })
    }
    updates.name = name.trim().slice(0, 200)
  }
  if (description !== undefined) updates.description = String(description).slice(0, 5000)
  if (category_id !== undefined) {
    if (category_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)) {
      return res.status(400).json({ error: 'Invalid category ID' })
    }
    updates.category_id = category_id || null
  }
  if (price_per_day !== undefined) {
    const price = Number(price_per_day)
    if (isNaN(price) || price < 0) return res.status(400).json({ error: 'Invalid price' })
    updates.price_per_day = price
  }
  if (deposit !== undefined) {
    const dep = Number(deposit)
    if (isNaN(dep) || dep < 0) return res.status(400).json({ error: 'Invalid deposit' })
    updates.deposit = dep
  }
  if (stock !== undefined) {
    const st = Number(stock)
    if (isNaN(st) || st < 0 || !Number.isInteger(st)) return res.status(400).json({ error: 'Invalid stock' })
    updates.stock = st
  }
  if (is_available !== undefined) updates.is_available = Boolean(is_available)
  if (location !== undefined) updates.location = String(location).slice(0, 500)
  if (images !== undefined) {
    if (!Array.isArray(images)) return res.status(400).json({ error: 'Images must be an array' })
    updates.images = images.filter(img => typeof img === 'string' && img.length < 2000).slice(0, 10)
  }
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select('*, categories(name, slug)')
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json(data)
}

export async function deleteProduct(req, res) {
  const { id } = req.params

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('supplier_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Product not found' })
  }

  if (existing.supplier_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ success: true })
}
