const API_URL = 'http://localhost:3001/api'

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}
