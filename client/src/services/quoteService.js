import { getFreshToken } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function createQuote(data, token) {
  // Always use a fresh token to avoid expired session issues
  const freshToken = token || await getFreshToken()
  const headers = { 'Content-Type': 'application/json' }
  if (freshToken) headers.Authorization = `Bearer ${freshToken}`

  const res = await fetch(`${API_URL}/quotes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to submit quote')
  }
  return res.json()
}

export async function fetchClientQuotes(token) {
  const res = await fetch(`${API_URL}/quotes/client/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch quotes')
  return res.json()
}

export async function updateQuoteStatus(id, status, token) {
  const res = await fetch(`${API_URL}/quotes/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update quote')
  return res.json()
}
