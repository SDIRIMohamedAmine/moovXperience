import { supabase } from '../lib/supabase.js'
import { cacheGet, cacheSet } from '../lib/cache.js'

export async function getPublicSettings(req, res) {
  const cached = await cacheGet('settings')
  if (cached) return res.json(cached)

  const { data, error } = await supabase
    .from('global_settings')
    .select('key, value')

  if (error) {
    console.error('Settings fetch error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch settings' })
  }

  const settings = {}
  for (const row of data) settings[row.key] = row.value
  cacheSet('settings', settings, 300)
  res.json(settings)
}
