const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function initiatePayment(rentalId, token) {
  const res = await fetch(`${API_URL}/payments/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rental_id: rentalId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Payment initiation failed')
  }

  return res.json()
}
