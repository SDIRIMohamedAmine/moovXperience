import { supabase } from '../lib/supabase.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function createQuote(req, res) {
  const {
    product_id,
    client_name,
    client_email,
    client_phone,
    company_name,
    mode,
    duration_days,
    options,
    event_date,
    event_location,
    notes,
    estimated_total,
  } = req.body

  if (!product_id || !UUID_RE.test(product_id)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }
  if (!client_name || typeof client_name !== 'string' || client_name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (!client_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email)) {
    return res.status(400).json({ error: 'Valid email is required' })
  }
  if (!mode || !['rental', 'purchase'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' })
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price_per_day, price_purchase, options')
    .eq('id', product_id)
    .is('deleted_at', null)
    .single()

  if (productError || !product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  let safeOptions = []
  if (Array.isArray(options)) {
    safeOptions = options
      .filter(opt => opt && typeof opt.name === 'string' && typeof opt.price === 'number')
      .map(opt => ({ name: opt.name.slice(0, 100), price: opt.price, description: opt.description?.slice(0, 200) || '' }))
      .slice(0, 10)
  }

  const total = Number(estimated_total)
  if (isNaN(total) || total < 0) {
    return res.status(400).json({ error: 'Invalid estimated total' })
  }

  const durDays = duration_days ? Number(duration_days) : null
  if (durDays !== null && (isNaN(durDays) || durDays < 1 || !Number.isInteger(durDays))) {
    return res.status(400).json({ error: 'Invalid duration' })
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      product_id,
      client_id: req.user?.id || null,
      client_name: client_name.trim().slice(0, 200),
      client_email: client_email.trim().slice(0, 200),
      client_phone: client_phone ? String(client_phone).slice(0, 50) : null,
      company_name: company_name ? String(company_name).slice(0, 200) : null,
      mode,
      duration_days: durDays,
      options: safeOptions,
      event_date: event_date || null,
      event_location: event_location ? String(event_location).slice(0, 500) : null,
      notes: notes ? String(notes).slice(0, 2000) : null,
      estimated_total: total,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Quote error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  // Send emails
  try {
    const { sendDemandNotificationToAdmin, sendDemandConfirmationToClient } = await import('../services/emailService.js')

    // Notify admin
    sendDemandNotificationToAdmin({
      productName: product.name,
      clientName: client_name.trim(),
      clientEmail: client_email.trim(),
      clientPhone: client_phone,
      companyName: company_name,
      mode,
      durationDays: durDays,
      options: safeOptions,
      estimatedTotal: total,
      eventDate: event_date,
      eventLocation: event_location,
      notes,
      quoteId: data.id,
    }).catch(err => console.error('Admin email failed:', err.message))

    // Confirm to client
    sendDemandConfirmationToClient({
      clientEmail: client_email.trim(),
      clientName: client_name.trim(),
      productName: product.name,
      mode,
      estimatedTotal: total,
      quoteId: data.id,
    }).catch(err => console.error('Client email failed:', err.message))
  } catch (emailErr) {
    console.error('Failed to send emails:', emailErr)
  }

  res.status(201).json({ id: data.id, message: 'Quote request submitted successfully' })
}

export async function getAllQuotes(req, res) {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, product_id, client_name, client_email, mode, duration_days, options, event_date, event_location, estimated_total, status, created_at, products(name, images)')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch quotes' })
  }

  res.json(data)
}

export async function getClientQuotes(req, res) {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, product_id, mode, duration_days, estimated_total, status, created_at, products(name, images)')
    .eq('client_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch quotes' })
  }

  res.json(data)
}

export async function updateQuoteStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid quote ID' })
  }

  if (!['sent', 'accepted', 'rejected', 'expired'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('quotes')
    .select('id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Quote not found' })
  }

  const { error } = await supabase
    .from('quotes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Quote error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json({ success: true })
}
