const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function fetchAvailability(productId, month) {
  const params = month ? `?month=${month}` : ''
  const res = await fetch(`${API_URL}/products/${productId}/availability${params}`)
  if (!res.ok) throw new Error('Failed to fetch availability')
  return res.json()
}

export async function createRental(data, token) {
  const res = await fetch(`${API_URL}/rentals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create rental')
  }
  return res.json()
}

export async function fetchMyRentals(token, status) {
  const params = status ? `?status=${status}` : ''
  const res = await fetch(`${API_URL}/rentals${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch rentals')
  return res.json()
}

export async function updateRentalStatus(id, status, token) {
  const res = await fetch(`${API_URL}/rentals/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update status')
  }
  return res.json()
}
