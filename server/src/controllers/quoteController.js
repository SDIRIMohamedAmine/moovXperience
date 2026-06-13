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
  console.log('[QUOTE] Quote created:', data.id, '| client:', client_email, '| product:', product.name)
  try {
    const { sendDemandNotificationToAdmin, sendDemandConfirmationToClient } = await import('../services/emailService.js')
    console.log('[QUOTE] Email module loaded, sending...')

    // Notify admin
    const adminResult = await sendDemandNotificationToAdmin({
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
    }).catch(err => { console.error('[QUOTE] Admin email failed:', err.message); return null })
    console.log('[QUOTE] Admin email result:', adminResult ? 'OK' : 'NULL')

    // Delay between emails to avoid Gmail rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Confirm to client
    const clientResult = await sendDemandConfirmationToClient({
      clientEmail: client_email.trim(),
      clientName: client_name.trim(),
      productName: product.name,
      mode,
      estimatedTotal: total,
      quoteId: data.id,
    }).catch(err => { console.error('[QUOTE] Client email failed:', err.message); return null })
    console.log('[QUOTE] Client email result:', clientResult ? 'OK' : 'NULL')
  } catch (emailErr) {
    console.error('[QUOTE] Failed to send emails:', emailErr)
  }

  res.status(201).json({ id: data.id, message: 'Quote request submitted successfully' })
}

export async function getQuoteStatus(req, res) {
  const { email, quote_id } = req.query

  if (!email && !quote_id) {
    return res.status(400).json({ error: 'Email or quote ID required' })
  }

  let query = supabase
    .from('quotes')
    .select('id, client_name, client_email, mode, estimated_total, status, created_at, products(name)')
    .order('created_at', { ascending: false })
    .limit(10)

  if (quote_id) {
    query = query.eq('id', quote_id)
  } else if (email) {
    query = query.eq('client_email', email.trim().toLowerCase())
  }

  const { data, error } = await query

  if (error) {
    console.error('Quote status lookup error:', error.message)
    return res.status(400).json({ error: 'Search failed' })
  }

  res.json({ quotes: data || [] })
}

export async function deleteQuote(req, res) {
  const { id } = req.params
  const userEmail = req.user?.email

  if (!userEmail) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // First verify the quote belongs to this user
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('id, client_email, status')
    .eq('id', id)
    .single()

  if (fetchError || !quote) {
    return res.status(404).json({ error: 'Demande non trouvée' })
  }

  if (quote.client_email !== userEmail) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  if (quote.status !== 'pending') {
    return res.status(400).json({ error: 'Seules les demandes en attente peuvent être supprimées' })
  }

  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Quote delete error:', error.message)
    return res.status(400).json({ error: 'Suppression échouée' })
  }

  res.json({ message: 'Demande supprimée' })
}

export async function getAllQuotes(req, res) {
  const { client_id } = req.query

  let query = supabase
    .from('quotes')
    .select('id, product_id, client_id, client_name, client_email, mode, duration_days, options, event_date, event_location, estimated_total, status, created_at, products(name, images)')
    .order('created_at', { ascending: false })

  if (client_id) {
    query = query.eq('client_id', client_id)
  }

  const { data, error } = await query

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

  const { data: quoteData } = await supabase
    .from('quotes')
    .select('client_name, client_email, estimated_total, mode, products(name)')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('quotes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Quote error:', error.message)
    return res.status(400).json({ error: 'Operation failed' })
  }

  res.json({ success: true })

  // Send confirmation email to client when demand is accepted
  if (status === 'accepted' && quoteData?.client_email) {
    try {
      const { sendDemandConfirmationToClient } = await import('../services/emailService.js')
      sendDemandConfirmationToClient({
        clientEmail: quoteData.client_email,
        clientName: quoteData.client_name || 'Client',
        productName: quoteData.products?.name || 'Solution',
        mode: quoteData.mode,
        estimatedTotal: quoteData.estimated_total,
        quoteId: id,
      }).catch(err => console.error('Demand confirmation email failed:', err.message))
    } catch (err) {
      console.error('Email notification error:', err.message)
    }
  }
}
