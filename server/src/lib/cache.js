import Keyv from 'keyv'
import KeyvSqlite from '@keyv/sqlite'

const store = new KeyvSqlite('sqlite://cache.sqlite')
const cache = new Keyv({ store, namespace: 'mxp' })

cache.on('error', (err) => {
  console.warn('[CACHE] SQLite error:', err.message)
})

console.log('[CACHE] SQLite cache ready')

/**
 * Get a cached value by key. Returns parsed value or null.
 */
export async function cacheGet(key) {
  try {
    const val = await cache.get(key)
    return val !== undefined ? val : null
  } catch {
    return null
  }
}

/**
 * Set a cache key with a TTL (seconds).
 */
export async function cacheSet(key, value, ttlSeconds = 60) {
  try {
    await cache.set(key, value, ttlSeconds * 1000)
  } catch { /* ignore */ }
}

/**
 * Delete keys matching a pattern (e.g. "products:*").
 * Strips the namespace prefix from iterator keys before matching.
 */
export async function cacheDel(pattern) {
  try {
    if (!pattern.includes('*')) {
      await cache.delete(pattern)
      return
    }

    const prefix = pattern.replace('*', '')
    const toDelete = []
    for await (const [fullKey] of cache.store.iterator()) {
      // Strip namespace prefix ("mxp:") to get the logical key
      const key = fullKey.startsWith('mxp:') ? fullKey.slice(4) : fullKey
      if (key.startsWith(prefix)) {
        toDelete.push(key)
      }
    }
    await Promise.all(toDelete.map(k => cache.delete(k)))
  } catch { /* ignore */ }
}
