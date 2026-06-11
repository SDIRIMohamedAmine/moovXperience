const KONNECT_API_URL = process.env.KONNECT_API_URL || 'https://api.sandbox.konnect.network/api/v2'
const KONNECT_API_KEY = process.env.KONNECT_API_KEY
const KONNECT_WALLET_ID = process.env.KONNECT_WALLET_ID

/**
 * Initiate a payment with Konnect
 * @param {Object} params
 * @param {number} params.amount - Amount in TND (will be converted to Millimes)
 * @param {string} params.description - Payment description
 * @param {string} params.orderId - Internal order/rental ID
 * @param {string} params.email - Payer email
 * @param {string} params.firstName - Payer first name
 * @param {string} params.lastName - Payer last name
 * @returns {{ payUrl: string, paymentRef: string }}
 */
export async function initiatePayment({ amount, description, orderId, email, firstName, lastName }) {
  if (!KONNECT_API_KEY) {
    throw new Error('KONNECT_API_KEY not configured')
  }
  if (!KONNECT_WALLET_ID) {
    throw new Error('KONNECT_WALLET_ID not configured')
  }

  // Convert TND to Millimes (1 TND = 1000 Millimes)
  const amountInMillimes = Math.round(amount * 1000)

  const body = {
    receiverWalletId: KONNECT_WALLET_ID,
    token: 'TND',
    amount: amountInMillimes,
    type: 'immediate',
    description: description || `Payment for rental ${orderId}`,
    acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
    lifespan: 30, // 30 minutes to complete payment
    checkoutForm: true,
    addPaymentFeesToAmount: false,
    orderId,
    webhook: process.env.KONNECT_WEBHOOK_URL || undefined,
    theme: 'light',
  }

  if (email) body.email = email
  if (firstName) body.firstName = firstName
  if (lastName) body.lastName = lastName

  const res = await fetch(`${KONNECT_API_URL}/payments/init-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KONNECT_API_KEY,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Konnect API error: ${res.status}`)
  }

  const data = await res.json()
  return {
    payUrl: data.payUrl,
    paymentRef: data.paymentRef,
  }
}

/**
 * Get payment status from Konnect
 * @param {string} paymentRef
 * @returns {Object} Payment details including status
 */
export async function getPaymentStatus(paymentRef) {
  if (!KONNECT_API_KEY) {
    throw new Error('KONNECT_API_KEY not configured')
  }

  const res = await fetch(`${KONNECT_API_URL}/payments/${paymentRef}`, {
    method: 'GET',
    headers: {
      'x-api-key': KONNECT_API_KEY,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Konnect API error: ${res.status}`)
  }

  return res.json()
}
