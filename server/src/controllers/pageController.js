import { supabase } from '../lib/supabase.js'
import { cacheGet, cacheSet } from '../lib/cache.js'

export async function getPage(req, res) {
  const { slug } = req.params
  const lang = req.query.lang || 'fr'

  const cacheKey = `page:${slug}:${lang}`
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('slug', slug)
    .eq('lang', lang)
    .maybeSingle()

  if (error) {
    console.error('Page fetch error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch page' })
  }

  if (!data) return res.json(null)

  cacheSet(cacheKey, data, 300)
  res.json(data)
}
