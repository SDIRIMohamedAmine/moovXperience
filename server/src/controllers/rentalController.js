import { supabase } from '../lib/supabase.js'
import { sendRentalNotification, sendRentalConfirmation } from '../services/emailService.js'

const MAX_RENTAL_DAYS = 90
const MAX_ITEMS = 50
const MAX_QUANTITY_PER_ITEM = 100
const MAX_NOTES_LENGTH = 2000

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const VALID_STATUSES = ['pending', 'confirmed', 'delivered', 'returned', 'completed', 'cancelled']

async function getUserProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return data
}

// GET /api/products/:id/availability?month=YYYY-MM
export async function getAvailability(req, res) {
  const { id } = req.params
  const { month } = req.query

  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  let startDate, endDate
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    startDate = `${month}-01`
    const [y, m] = month.split('-').map(Number)
    const lastDay = new Date(y, m, 0).getDate()
    endDate = `${month}-${String(lastDay).padStart(2, '0')}`
  } else {
    const now = new Date()
    startDate = now.toISOString().split('T')[0]
    const twoMonths = new Date(now)
    twoMonths.setMonth(twoMonths.getMonth() + 2)
    twoMonths.setDate(0)
    endDate = twoMonths.toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('rental_items')
    .select('rentals!inner(start_date, end_date, status)')
    .eq('product_id', id)
    .in('rentals.status', ['pending', 'confirmed', 'delivered'])
    .lte('rentals.start_date', endDate)
    .gte('rentals.end_date', startDate)

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch availability' })
  }

  const ranges = (data || [])
    .map(item => ({
      start_date: item.rentals.start_date,
      end_date: item.rentals.end_date,
    }))
    .sort((a, b) => a.start_date.localeCompare(b.start_date))

  res.json({ unavailable: ranges })
}

// POST /api/rentals
export async function createRental(req, res) {
  const { items, start_date, end_date, notes, delivery_address } = req.body

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'Start and end dates are required' })
  }

  if (!DATE_RE.test(start_date) || !DATE_RE.test(end_date)) {
    return res.status(400).json({ error: 'Invalid date format (expected YYYY-MM-DD)' })
  }

  const start = new Date(start_date + 'T00:00:00Z')
  const end = new Date(end_date + 'T00:00:00Z')
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  if (start < today) {
    return res.status(400).json({ error: 'Start date cannot be in the past' })
  }

  if (end < start) {
    return res.status(400).json({ error: 'End date must be after start date' })
  }

  const nbDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  if (nbDays > MAX_RENTAL_DAYS) {
    return res.status(400).json({ error: `Maximum rental duration is ${MAX_RENTAL_DAYS} days` })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' })
  }

  if (items.length > MAX_ITEMS) {
    return res.status(400).json({ error: `Too many items (max ${MAX_ITEMS})` })
  }

  const seenProducts = new Set()
  for (const item of items) {
    if (!item.product_id || !UUID_RE.test(item.product_id)) {
      return res.status(400).json({ error: 'Invalid product ID in items' })
    }
    if (seenProducts.has(item.product_id)) {
      return res.status(400).json({ error: 'Duplicate product in items' })
    }
    seenProducts.add(item.product_id)
    const qty = Number(item.quantity) || 1
    if (qty < 1 || !Number.isInteger(qty) || qty > MAX_QUANTITY_PER_ITEM) {
      return res.status(400).json({ error: `Invalid quantity (must be 1-${MAX_QUANTITY_PER_ITEM})` })
    }
  }

  const productIds = [...seenProducts]

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price_per_day, stock, is_available')
    .in('id', productIds)

  if (productsError || !products || products.length !== productIds.length) {
    return res.status(400).json({ error: 'One or more products not found' })
  }

  for (const product of products) {
    if (!product.is_available) {
      return res.status(400).json({ error: `Product ${product.id} is not available` })
    }
    const item = items.find(i => i.product_id === product.id)
    const qty = Number(item.quantity) || 1
    if (qty > product.stock) {
      return res.status(400).json({ error: `Insufficient stock for product ${product.id}` })
    }
  }

  const { data: overlapping, error: overlapError } = await supabase
    .from('rental_items')
    .select('product_id, quantity, rentals!inner(start_date, end_date, status)')
    .in('product_id', productIds)
    .in('rentals.status', ['pending', 'confirmed', 'delivered'])
    .lte('rentals.start_date', end_date)
    .gte('rentals.end_date', start_date)

  if (overlapError) {
    return res.status(500).json({ error: 'Failed to check availability' })
  }

  const reserved = {}
  for (const row of overlapping || []) {
    reserved[row.product_id] = (reserved[row.product_id] || 0) + row.quantity
  }

  for (const item of items) {
    const product = products.find(p => p.id === item.product_id)
    const qty = Number(item.quantity) || 1
    const reservedQty = reserved[item.product_id] || 0
    if (reservedQty + qty > product.stock) {
      return res.status(409).json({
        error: `Insufficient availability for product ${item.product_id} (${product.stock - reservedQty} remaining)`,
      })
    }
  }

  let totalPrice = 0
  const rentalItems = items.map(item => {
    const product = products.find(p => p.id === item.product_id)
    const qty = Number(item.quantity) || 1
    const subtotal = product.price_per_day * qty * nbDays
    totalPrice += subtotal
    return {
      product_id: item.product_id,
      quantity: qty,
      price_per_day: product.price_per_day,
      subtotal,
    }
  })

  const sanitizedNotes = notes
    ? String(notes).replace(/[<>&"']/g, '').slice(0, MAX_NOTES_LENGTH).trim() || null
    : null

  const { data: rental, error: rentalError } = await supabase
    .from('rentals')
    .insert({
      client_id: req.user.id,
      status: 'pending',
      start_date,
      end_date,
      total_price: totalPrice,
      notes: sanitizedNotes,
      delivery_address: delivery_address ? JSON.parse(JSON.stringify(delivery_address).slice(0, 2000)) : null,
    })
    .select()
    .single()

  if (rentalError) {
    console.error('Create rental error:', rentalError.message)
    return res.status(400).json({ error: 'Failed to create rental' })
  }

  const itemsToInsert = rentalItems.map(item => ({
    ...item,
    rental_id: rental.id,
  }))

  const { data: insertedItems, error: itemsError } = await supabase
    .from('rental_items')
    .insert(itemsToInsert)
    .select('*, products(name, images)')

  if (itemsError) {
    console.error('Create rental items error:', itemsError.message)
    await supabase.from('rentals').delete().eq('id', rental.id)
    return res.status(400).json({ error: 'Failed to create rental items' })
  }

  // TOCTOU recheck
  const { data: recheck } = await supabase
    .from('rental_items')
    .select('product_id, quantity, rentals!inner(start_date, end_date, status)')
    .in('product_id', productIds)
    .in('rentals.status', ['pending', 'confirmed', 'delivered'])
    .lte('rentals.start_date', end_date)
    .gte('rentals.end_date', start_date)

  const recheckReserved = {}
  for (const row of recheck || []) {
    recheckReserved[row.product_id] = (recheckReserved[row.product_id] || 0) + row.quantity
  }

  for (const item of items) {
    const product = products.find(p => p.id === item.product_id)
    const qty = Number(item.quantity) || 1
    if ((recheckReserved[item.product_id] || 0) > product.stock) {
      await supabase.from('rental_items').delete().eq('rental_id', rental.id)
      await supabase.from('rentals').delete().eq('id', rental.id)
      return res.status(409).json({ error: 'Concurrent booking detected, please retry' })
    }
  }

  res.status(201).json({ ...rental, items: insertedItems })

  // Send confirmation email to client (non-blocking)
  console.log('[RENTAL] Rental created, attempting emails... user:', req.user?.email)
  try {
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', req.user.id)
      .single()

    const clientName = clientProfile?.full_name || 'Client'
    const clientEmail = req.user.email

    console.log('[RENTAL] clientEmail:', clientEmail, '| clientName:', clientName)
    if (clientEmail) {
      console.log('[RENTAL] Calling sendRentalConfirmation...')
      sendRentalConfirmation({
        clientEmail,
        clientName,
        rental,
        items: insertedItems,
      }).then(r => console.log('[RENTAL] Client email result:', r ? 'OK' : 'NULL'))
       .catch(err => console.error('[RENTAL] Client email failed:', err.message))

      console.log('[RENTAL] Calling sendRentalNotification...')
      sendRentalNotification({
        clientName,
        rental,
        items: insertedItems,
      }).then(r => console.log('[RENTAL] Admin email result:', r ? 'OK' : 'NULL'))
       .catch(err => console.error('[RENTAL] Admin notification failed:', err.message))
    } else {
      console.warn('[RENTAL] No clientEmail found on req.user — skipping emails')
    }
  } catch (err) {
    console.error('[RENTAL] Email notification error:', err.message)
  }
}

// GET /api/rentals
export async function getRentals(req, res) {
  const { status } = req.query

  // All users see their own rentals
  const { data: clientRentals, error: clientError } = await supabase
    .from('rentals')
    .select('*, rental_items(*, products(name, images, deleted_at))')
    .eq('client_id', req.user.id)
    .order('created_at', { ascending: false })

  if (clientError) {
    return res.status(500).json({ error: 'Failed to fetch rentals' })
  }

  const filteredRentals = (clientRentals || []).map(rental => ({
    ...rental,
    rental_items: (rental.rental_items || []).filter(item => !item.products?.deleted_at)
  }))

  if (status && VALID_STATUSES.includes(status)) {
    return res.json(filteredRentals.filter(r => r.status === status))
  }

  res.json(filteredRentals)
}

// PATCH /api/rentals/:id/status
export async function updateRentalStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid rental ID' })
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  const { data: rental, error: fetchError } = await supabase
    .from('rentals')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !rental) {
    return res.status(404).json({ error: 'Rental not found' })
  }

  const isClient = rental.client_id === req.user.id
  const isAdmin = req.user.isAdmin || (await getUserProfile(req.user.id))?.role === 'admin'

  if (!isClient && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const allowed = {
    client: {
      pending: ['cancelled'],
    },
    admin: {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['delivered'],
      delivered: ['returned'],
      returned: ['completed'],
    },
  }

  const role = isClient ? 'client' : 'admin'
  const allowedTransitions = allowed[role]?.[rental.status] || []

  if (!allowedTransitions.includes(status)) {
    return res.status(400).json({
      error: `Cannot transition from '${rental.status}' to '${status}' as ${role}`,
    })
  }

  if (isClient && status === 'cancelled') {
    const startDate = new Date(rental.start_date + 'T00:00:00Z')
    const now = new Date()
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60)
    if (hoursUntilStart < 48) {
      return res.status(400).json({
        error: 'Cannot cancel less than 48 hours before the rental start date',
      })
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('rentals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Rental update error:', updateError.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json(updated)

  // Stock management: reduce on confirm, restore on return/cancel
  if (status === 'confirmed' || status === 'returned' || (status === 'cancelled' && rental.status === 'confirmed')) {
    try {
      const { data: items } = await supabase
        .from('rental_items')
        .select('product_id, quantity')
        .eq('rental_id', id)

      if (items?.length) {
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single()

          if (product) {
            let newStock = product.stock
            if (status === 'confirmed') {
              newStock = Math.max(0, product.stock - item.quantity)
            } else {
              // returned or cancelled-after-confirm: restore stock
              newStock = product.stock + item.quantity
            }
            await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.product_id)
          }
        }
      }
    } catch (err) {
      console.error('Stock update error:', err.message)
    }
  }

  // Send email notification to client on status change
  if (status === 'confirmed' || status === 'cancelled') {
    try {
      const { sendRentalStatusUpdateToClient } = await import('../services/emailService.js')

      // Get client email
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', rental.client_id)
        .single()

      // Get client email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(rental.client_id)

      if (user?.email) {
        sendRentalStatusUpdateToClient({
          clientEmail: user.email,
          clientName: clientProfile?.full_name || 'Client',
          rentalId: rental.id,
          status,
          startDate: rental.start_date,
          endDate: rental.end_date,
          totalPrice: rental.total_price,
        }).catch(err => console.error('Status update email failed:', err.message))
      }
    } catch (err) {
      console.error('Email notification error:', err.message)
    }
  }
}
