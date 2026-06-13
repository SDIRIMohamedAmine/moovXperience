import { supabase } from '../lib/supabase.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST /api/reviews
export async function createReview(req, res) {
  const { rental_id, product_id, rating, comment } = req.body

  // Validate inputs
  if (!rental_id || !UUID_RE.test(rental_id)) {
    return res.status(400).json({ error: 'Invalid rental ID' })
  }
  if (!product_id || !UUID_RE.test(product_id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' })
  }

  // Check rental exists, belongs to client, and is completed
  const { data: rental, error: rentalError } = await supabase
    .from('rentals')
    .select('id, status, client_id')
    .eq('id', rental_id)
    .single()

  if (rentalError || !rental) {
    return res.status(404).json({ error: 'Rental not found' })
  }

  if (rental.client_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  if (rental.status !== 'completed') {
    return res.status(400).json({ error: 'Can only review completed rentals' })
  }

  // Check the product was actually in this rental
  const { data: rentalItem } = await supabase
    .from('rental_items')
    .select('id')
    .eq('rental_id', rental_id)
    .eq('product_id', product_id)
    .single()

  if (!rentalItem) {
    return res.status(400).json({ error: 'Product was not in this rental' })
  }

  // Check no existing review for this rental+product combo
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('rental_id', rental_id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    return res.status(409).json({ error: 'Already reviewed' })
  }

  // Sanitize comment
  const sanitizedComment = comment
    ? String(comment).replace(/[<>&"']/g, '').slice(0, 2000).trim() || null
    : null

  // Insert review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      rental_id,
      client_id: req.user.id,
      product_id,
      rating,
      comment: sanitizedComment,
    })
    .select()
    .single()

  if (reviewError) {
    console.error('Review error:', reviewError.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.status(201).json(review)
}

// GET /api/reviews/product/:productId
export async function getProductReviews(req, res) {
  const { productId } = req.params

  if (!UUID_RE.test(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, profiles!client_id(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch reviews' })
  }

  res.json(data || [])
}

// GET /api/reviews/recent
export async function getRecentReviews(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 6, 12)

  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, profiles!client_id(full_name), products!product_id(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Recent reviews error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch reviews' })
  }

  res.json(data || [])
}

// GET /api/reviews/check/:rentalId
export async function checkReviewEligibility(req, res) {
  const { rentalId } = req.params

  if (!UUID_RE.test(rentalId)) {
    return res.status(400).json({ error: 'Invalid rental ID' })
  }

  // Get rental with items
  const { data: rental } = await supabase
    .from('rentals')
    .select('id, status, client_id, rental_items(product_id)')
    .eq('id', rentalId)
    .single()

  if (!rental || rental.client_id !== req.user.id) {
    return res.status(404).json({ error: 'Rental not found' })
  }

  if (rental.status !== 'completed') {
    return res.json({ eligible: false, reason: 'Rental not completed' })
  }

  // Check which products already have reviews
  const productIds = (rental.rental_items || []).map(i => i.product_id)

  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('rental_id', rentalId)
    .in('product_id', productIds)

  const reviewedProductIds = new Set((existingReviews || []).map(r => r.product_id))
  const unreviewedProducts = productIds.filter(id => !reviewedProductIds.has(id))

  res.json({
    eligible: unreviewedProducts.length > 0,
    products: rental.rental_items
      .filter(i => unreviewedProducts.includes(i.product_id))
      .map(i => i.product_id),
    reviewed: [...reviewedProductIds],
  })
}
