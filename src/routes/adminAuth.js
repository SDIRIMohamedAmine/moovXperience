import { Router } from 'express'
import crypto from 'crypto'

const router = Router()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'moovxperience-admin-secret-2024'

// Generate a simple admin token
function generateAdminToken() {
  const payload = {
    email: ADMIN_EMAIL,
    role: 'admin',
    iat: Date.now(),
  }
  const data = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(data).digest('hex')
  return Buffer.from(data).toString('base64') + '.' + signature
}

// Verify admin token
export function verifyAdminToken(token) {
  try {
    const [dataB64, signature] = token.split('.')
    if (!dataB64 || !signature) return null
    const data = Buffer.from(dataB64, 'base64').toString('utf8')
    const expectedSig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(data).digest('hex')
    if (signature !== expectedSig) return null
    const payload = JSON.parse(data)
    if (payload.email !== ADMIN_EMAIL) return null
    // Token valid for 24 hours
    if (Date.now() - payload.iat > 24 * 60 * 60 * 1000) return null
    return payload
  } catch {
    return null
  }
}

// Admin login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin credentials not configured' })
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = generateAdminToken()

  res.json({
    token,
    user: {
      email: ADMIN_EMAIL,
      role: 'admin',
    },
  })
})

// Verify token endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false })
  }

  const token = authHeader.slice(7)
  const payload = verifyAdminToken(token)

  if (!payload) {
    return res.status(401).json({ valid: false })
  }

  res.json({ valid: true, email: payload.email, role: payload.role })
})

export default router
