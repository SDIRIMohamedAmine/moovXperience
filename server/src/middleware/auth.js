import { supabase } from '../lib/supabase.js'
import { verifyAdminToken } from '../routes/adminAuth.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  // Basic token format validation
  if (!token || token.length < 10 || token.length > 5000) {
    return res.status(401).json({ error: 'Invalid token format' })
  }

  // First try admin token (from .env login)
  const adminPayload = verifyAdminToken(token)
  if (adminPayload) {
    req.user = { id: null, email: adminPayload.email, role: 'admin', isAdmin: true }
    return next()
  }

  // Then try Supabase token
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Token verification failed' })
  }
}
