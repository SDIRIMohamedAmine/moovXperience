import { supabase } from '../lib/supabase.js'

export async function getCategories(req, res) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Categories fetch error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch categories' })
  }

  res.json(data)
}
