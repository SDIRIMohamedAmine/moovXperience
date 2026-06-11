import { supabase } from '../lib/supabase.js'
import { initiatePayment, getPaymentStatus } from '../services/konnectService.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST /api/payments/init
export async function initPayment(req, res) {
  const { rental_id } = req.body

  if (!rental_id || !UUID_RE.test(rental_id)) {
    return res.status(400).json({ error: 'Invalid rental ID' })
  }

  // Fetch the rental
  const { data: rental, error: fetchError } = await supabase
    .from('rentals')
    .select('*, profiles!client_id(full_name, email)')
    .eq('id', rental_id)
    .single()

  if (fetchError || !rental) {
    return res.status(404).json({ error: 'Rental not found' })
  }

  // Only the client who owns the rental can pay
  if (rental.client_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  // Rental must be confirmed by supplier
  if (rental.status !== 'confirmed') {
    return res.status(400).json({ error: 'Rental must be confirmed by supplier before payment' })
  }

  // Payment must be pending
  if (rental.payment_status !== 'pending') {
    return res.status(400).json({ error: 'Payment already processed' })
  }

  try {
    const profile = rental.profiles
    const result = await initiatePayment({
      amount: rental.total_price,
      description: `Location #${rental.id.slice(0, 8)} — MoovXperience`,
      orderId: rental.id,
      email: profile?.email || req.user.email,
      firstName: profile?.full_name?.split(' ')[0] || '',
      lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    })

    // Save payment_ref on rental
    await supabase
      .from('rentals')
      .update({ payment_ref: result.paymentRef })
      .eq('id', rental.id)

    res.json({ payUrl: result.payUrl, paymentRef: result.paymentRef })
  } catch (err) {
    console.error('Payment initiation failed:', err.message)
    res.status(500).json({ error: 'Payment initiation failed' })
  }
}

// GET /api/payments/callback — Konnect redirects here after payment
export async function paymentCallback(req, res) {
  const { payment_ref } = req.query
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  // Validate payment_ref format
  if (!payment_ref || !/^[a-zA-Z0-9]{20,50}$/.test(payment_ref)) {
    return res.redirect(`${clientUrl}/payment-result?status=error`)
  }

  try {
    // Find rental by payment_ref
    const { data: rental } = await supabase
      .from('rentals')
      .select('id, payment_status')
      .eq('payment_ref', payment_ref)
      .single()

    if (!rental) {
      return res.redirect(`${clientUrl}/payment-result?status=error`)
    }

    // Idempotency: if already processed, redirect with current status
    if (rental.payment_status === 'paid') {
      return res.redirect(`${clientUrl}/payment-result?status=success&rental=${rental.id}`)
    }
    if (rental.payment_status === 'failed') {
      return res.redirect(`${clientUrl}/payment-result?status=failed&rental=${rental.id}`)
    }

    const payment = await getPaymentStatus(payment_ref)

    // Konnect status: 'success', 'pending', 'failed', 'expired'
    if (payment.status === 'success') {
      await supabase
        .from('rentals')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', rental.id)

      return res.redirect(`${clientUrl}/payment-result?status=success&rental=${rental.id}`)
    }

    if (payment.status === 'failed' || payment.status === 'expired') {
      await supabase
        .from('rentals')
        .update({ payment_status: 'failed' })
        .eq('id', rental.id)

      return res.redirect(`${clientUrl}/payment-result?status=failed&rental=${rental.id}`)
    }

    // Still pending
    return res.redirect(`${clientUrl}/payment-result?status=pending&rental=${rental.id}`)
  } catch (err) {
    console.error('Payment callback error:', err.message)
    return res.redirect(`${clientUrl}/payment-result?status=error`)
  }
}

// GET /api/payments/webhook — Konnect sends notification here
export async function paymentWebhook(req, res) {
  const { payment_ref } = req.query

  // Validate payment_ref format (alphanumeric, 20-50 chars)
  if (!payment_ref || !/^[a-zA-Z0-9]{20,50}$/.test(payment_ref)) {
    return res.status(400).json({ error: 'Invalid payment reference' })
  }

  try {
    // Find rental first to check current payment status (idempotency)
    const { data: rental } = await supabase
      .from('rentals')
      .select('id, payment_status')
      .eq('payment_ref', payment_ref)
      .single()

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' })
    }

    // Idempotency: skip if already processed
    if (rental.payment_status === 'paid' || rental.payment_status === 'failed') {
      return res.status(200).json({ received: true, already_processed: true })
    }

    const payment = await getPaymentStatus(payment_ref)

    if (payment.status === 'success') {
      await supabase
        .from('rentals')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', rental.id)
    } else if (payment.status === 'failed' || payment.status === 'expired') {
      await supabase
        .from('rentals')
        .update({ payment_status: 'failed' })
        .eq('id', rental.id)
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}
