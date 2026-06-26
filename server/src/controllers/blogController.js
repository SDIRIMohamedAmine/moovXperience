import { supabase } from '../lib/supabase.js'
import { cacheGet, cacheSet } from '../lib/cache.js'

export async function getPublishedPosts(req, res) {
  const lang = req.query.lang || 'fr'

  const cacheKey = `blog:posts:${lang}`
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image, published_at, lang')
    .eq('status', 'published')
    .eq('lang', lang)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Blog fetch error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch posts' })
  }

  cacheSet(cacheKey, data || [], 120)
  res.json(data || [])
}

export async function getPostBySlug(req, res) {
  const { slug } = req.params

  const cacheKey = `blog:post:${slug}`
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.error('Blog fetch error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch post' })
  }

  if (!data) return res.status(404).json({ error: 'Post not found' })

  cacheSet(cacheKey, data, 120)
  res.json(data)
}
