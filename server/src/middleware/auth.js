import { supabase } from '../lib/supabase.js'
import { verifyAdminToken } from '../routes/adminAuth.js'

export async function requireAdmin(req, res, next) {
  // Check if this is an admin token from .env login
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const adminPayload = verifyAdminToken(token)
    if (adminPayload) {
      req.user = { id: null, email: adminPayload.email, role: 'admin', isAdmin: true }
      return next()
    }
  }

  // Otherwise check Supabase user role
  if (!req.user?.id) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}

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
