import { supabase } from '../lib/supabase.js'
import { cacheGet, cacheSet, cacheDel } from '../lib/cache.js'

function sanitizeSearch(input) {
  if (!input) return ''
  return input.replace(/[%_]/g, '\\$&').slice(0, 100)
}

export async function getProducts(req, res) {
  const { category, search, min_price, max_price, mode, pricing_type, provider, limit = 20, offset = 0 } = req.query

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const safeOffset = Math.max(Number(offset) || 0, 0)

  const cacheKey = `products:${category || ''}:${search || ''}:${mode || ''}:${provider || ''}:${min_price || ''}:${max_price || ''}:${safeLimit}:${safeOffset}`
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  let query = supabase
    .from('products')
    .select('id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, mode, pricing_type, provider, options, min_duration, created_at, categories(name, slug), product_ratings(avg_rating, review_count)', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (category && /^[a-z0-9-]+$/.test(category)) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (catData) {
      query = query.eq('category_id', catData.id)
    }
  }

  const sanitizedSearch = sanitizeSearch(search)
  if (sanitizedSearch) {
    query = query.textSearch('search_vector', sanitizedSearch, { type: 'websearch', config: 'french' })
  }

  if (min_price && !isNaN(Number(min_price))) {
    query = query.gte('price_per_day', Math.max(Number(min_price), 0))
  }

  if (max_price && !isNaN(Number(max_price))) {
    query = query.lte('price_per_day', Math.max(Number(max_price), 0))
  }

  if (mode && ['rental', 'sale', 'both'].includes(mode)) {
    query = query.in('mode', mode === 'both' ? ['both'] : [mode, 'both'])
  }

  if (pricing_type && ['fixed', 'negotiable', 'suggestion'].includes(pricing_type)) {
    query = query.eq('pricing_type', pricing_type)
  }

  if (provider && typeof provider === 'string' && provider.trim()) {
    query = query.eq('provider', provider.trim())
  }

  const { data, error, count } = await query

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch products' })
  }

  const result = { products: data, total: count }
  cacheSet(cacheKey, result, 60)
  res.json(result)
}

export async function getProduct(req, res) {
  const { id } = req.params

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const cacheKey = `product:${id}`
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, mode, pricing_type, options, min_duration, created_at, categories(name, slug), product_ratings(avg_rating, review_count)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Product not found' })
  }

  cacheSet(cacheKey, data, 120)
  res.json(data)
}

export async function getMyProducts(req, res) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, mode, pricing_type, options, min_duration, created_at, categories(name, slug)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch products' })
  }

  res.json(data)
}

export async function createProduct(req, res) {
  const { name, description, category_id, price_per_day, price_purchase, deposit, stock, images, mode, pricing_type, options, min_duration } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Product name is required' })
  }

  if (name.length > 200) {
    return res.status(400).json({ error: 'Product name too long (max 200 chars)' })
  }

  const validMode = ['rental', 'sale', 'both'].includes(mode) ? mode : 'rental'

  // price_per_day is only required for rental/both modes
  let price = price_per_day != null && price_per_day !== '' ? Number(price_per_day) : 0
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Invalid price' })
  }
  if ((validMode === 'rental' || validMode === 'both') && price <= 0) {
    return res.status(400).json({ error: 'Price per day is required for rental products' })
  }

  const purchasePrice = price_purchase != null ? Number(price_purchase) : null
  if (purchasePrice !== null && (isNaN(purchasePrice) || purchasePrice < 0)) {
    return res.status(400).json({ error: 'Invalid purchase price' })
  }

  const depositNum = Number(deposit || 0)
  if (isNaN(depositNum) || depositNum < 0) {
    return res.status(400).json({ error: 'Invalid deposit' })
  }

  const stockNum = Number(stock || 1)
  if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
    return res.status(400).json({ error: 'Invalid stock quantity' })
  }

  let safeImages = []
  if (Array.isArray(images)) {
    safeImages = images.filter(img => typeof img === 'string' && img.length < 2000 && /^https?:\/\//.test(img)).slice(0, 10)
  }

  if (category_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)) {
    return res.status(400).json({ error: 'Invalid category ID' })
  }

  const validPricingType = ['fixed', 'negotiable', 'suggestion'].includes(pricing_type) ? pricing_type : 'fixed'
  const validProvider = (typeof req.body.provider === 'string' && req.body.provider.trim()) ? req.body.provider.trim().slice(0, 100) : 'makerskills'

  let safeOptions = []
  if (Array.isArray(options)) {
    safeOptions = options.filter(opt =>
      opt && typeof opt.name === 'string' && typeof opt.price === 'number'
    ).slice(0, 10)
  }

  const minDur = Number(min_duration || 1)
  if (isNaN(minDur) || minDur < 1 || !Number.isInteger(minDur)) {
    return res.status(400).json({ error: 'Invalid minimum duration' })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: name.trim().slice(0, 200),
      description: description ? String(description).slice(0, 5000) : null,
      category_id: category_id || null,
      price_per_day: price,
      price_purchase: purchasePrice,
      deposit: depositNum,
      stock: stockNum,
      images: safeImages,
      mode: validMode,
      pricing_type: validPricingType,
      provider: validProvider,
      options: safeOptions,
      min_duration: minDur,
    })
    .select('*, categories(name, slug)')
    .single()

  if (error) {
    console.error('Create product error:', error.message)
    return res.status(400).json({ error: 'Failed to create product' })
  }

  cacheDel('products:*')
  cacheDel('admin:stats')
  res.status(201).json(data)
}

export async function updateProduct(req, res) {
  const { id } = req.params

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const { name, description, category_id, price_per_day, price_purchase, deposit, stock, is_available, images, mode, pricing_type, options, min_duration } = req.body

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
  if (price_purchase !== undefined) {
    if (price_purchase === null) {
      updates.price_purchase = null
    } else {
      const pp = Number(price_purchase)
      if (isNaN(pp) || pp < 0) return res.status(400).json({ error: 'Invalid purchase price' })
      updates.price_purchase = pp
    }
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
  if (images !== undefined) {
    if (!Array.isArray(images)) return res.status(400).json({ error: 'Images must be an array' })
    updates.images = images.filter(img => typeof img === 'string' && img.length < 2000 && /^https?:\/\//.test(img)).slice(0, 10)
  }
  if (mode !== undefined) {
    if (!['rental', 'sale', 'both'].includes(mode)) return res.status(400).json({ error: 'Invalid mode' })
    updates.mode = mode
  }
  if (pricing_type !== undefined) {
    if (!['fixed', 'negotiable', 'suggestion'].includes(pricing_type)) return res.status(400).json({ error: 'Invalid pricing type' })
  }
  if (req.body.provider !== undefined) {
    if (typeof req.body.provider !== 'string' || !req.body.provider.trim()) return res.status(400).json({ error: 'Invalid provider' })
    updates.provider = req.body.provider.trim().slice(0, 100)
    updates.pricing_type = pricing_type
  }
  if (options !== undefined) {
    if (!Array.isArray(options)) return res.status(400).json({ error: 'Options must be an array' })
    updates.options = options.filter(opt =>
      opt && typeof opt.name === 'string' && typeof opt.price === 'number'
    ).slice(0, 10)
  }
  if (min_duration !== undefined) {
    const md = Number(min_duration)
    if (isNaN(md) || md < 1 || !Number.isInteger(md)) return res.status(400).json({ error: 'Invalid minimum duration' })
    updates.min_duration = md
  }
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select('*, categories(name, slug)')
    .single()

  if (error) {
    console.error('Update product error:', error.message)
    return res.status(400).json({ error: 'Failed to update product' })
  }

  cacheDel('products:*')
  cacheDel(`product:${id}`)
  cacheDel('admin:stats')
  res.json(data)
}

export async function deleteProduct(req, res) {
  const { id } = req.params

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString(), is_available: false })
    .eq('id', id)

  if (error) {
    console.error('Product delete error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  cacheDel('products:*')
  cacheDel(`product:${id}`)
  cacheDel('admin:stats')
  res.json({ success: true })
}
