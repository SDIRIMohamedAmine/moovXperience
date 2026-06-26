import { supabase } from '../lib/supabase.js'
import { cacheGet, cacheSet } from '../lib/cache.js'

export async function getCategories(req, res) {
  const cached = await cacheGet('categories:all')
  if (cached) return res.json(cached)

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Categories fetch error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch categories' })
  }

  cacheSet('categories:all', data, 300)
  res.json(data)
}
